import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEPS } from "@/lib/steps";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StepActions } from "./StepActions";
import { CopyLink } from "./CopyLink";
import { ArchiveButton } from "./ArchiveButton";
import { CourseSection } from "./CourseSection";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { steps: { orderBy: { stepNumber: "asc" } }, ppeOrder: true },
  });

  if (!employee) notFound();

  const completed = employee.steps.filter((s) => s.status === "COMPLETED").length;
  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.token}`;

  // Parse step 3 data for courses and attachments
  const step3 = employee.steps.find((s) => s.stepNumber === 3);
  let courses: { kursnavn: string; gyldigFra: string; gyldigTil: string }[] = [];
  let attachments: { name: string; type: string; size: number; base64: string }[] = [];
  if (step3?.data) {
    try {
      const cvData = JSON.parse(step3.data);
      courses = (cvData.kurs || []).filter((k: { kursnavn: string }) => k.kursnavn);
      attachments = cvData.attachments || [];
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-navy-900">← Tilbake</Link>
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">{employee.name}</h2>
            <p className="text-gray-500 text-sm">{employee.email}</p>
            <p className="text-gray-400 text-sm mt-1">
              Startdato: {new Date(employee.startDate).toLocaleDateString("nb-NO")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Onboarding-lenke:</p>
            <CopyLink url={onboardingUrl} />
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar completed={completed} total={STEPS.length} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <ArchiveButton employeeId={employee.id} archived={employee.archived} />
        </div>
      </Card>

      {employee.archived && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Denne ansatte er arkivert. Klikk &quot;Gjenaktiver&quot; for å flytte tilbake til aktive ansatte.
        </div>
      )}

      <div className="space-y-3">
        {STEPS.map((step) => {
          const employeeStep = employee.steps.find((s) => s.stepNumber === step.number);
          const status = (employeeStep?.status || "NOT_STARTED") as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
          return (
            <Card key={step.number} padding="sm">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-navy-300">{step.number}</span>
                  <div>
                    <h3 className="font-medium text-navy-900">{step.name}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={status} />
                  {step.number === 3 && status === "COMPLETED" && (
                    <a
                      href={`/api/cv-pdf?employeeId=${employee.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-navy-100 text-navy-900 hover:bg-navy-200 transition-colors"
                      download
                    >
                      Last ned CV
                    </a>
                  )}
                  <StepActions employeeId={employee.id} stepNumber={step.number} status={status} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Course management */}
      <Card>
        <h3 className="font-semibold text-navy-900 mb-2">Kurs / Sertifikater</h3>
        {courses.length > 0 && (
          <div className="space-y-1 mb-3">
            {courses.map((k, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium">{k.kursnavn}</span>
                <span className="text-gray-500 text-xs">
                  {k.gyldigFra && new Date(k.gyldigFra).toLocaleDateString("nb-NO")} — {k.gyldigTil && new Date(k.gyldigTil).toLocaleDateString("nb-NO")}
                </span>
              </div>
            ))}
          </div>
        )}
        <CourseSection employeeId={employee.id} courses={courses} />
      </Card>

      {/* Attachments */}
      {attachments.length > 0 && (
        <Card>
          <h3 className="font-semibold text-navy-900 mb-2">Vedlegg</h3>
          <div className="space-y-1">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 bg-gray-50 rounded">
                <span className="font-medium">{att.name}</span>
                <a
                  href={att.base64}
                  download={att.name}
                  className="text-xs text-navy-700 hover:underline font-medium"
                >
                  Last ned
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
