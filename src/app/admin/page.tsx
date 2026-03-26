import Link from "next/link";
import { prisma } from "@/lib/db";
import { STEP_COUNT } from "@/lib/steps";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/Button";
import { CourseList } from "@/components/admin/CourseList";

export const dynamic = "force-dynamic";

interface CourseInfo {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
}

interface EmployeeCardData {
  id: string;
  name: string;
  email: string;
  startDate: Date;
  completed: number;
  profilbilde: string | null;
  stilling: string | null;
  kurs: CourseInfo[];
  hasCvData: boolean;
  archived: boolean;
}

function getCourseStatus(gyldigTil: string): "expired" | "warning" | "ok" | "unknown" {
  if (!gyldigTil) return "unknown";
  try {
    const expiry = new Date(gyldigTil);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths < 0) return "expired";
    if (diffMonths < 6) return "warning";
    return "ok";
  } catch {
    return "unknown";
  }
}

function formatCourseDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nb-NO", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const statusColors = {
  expired: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ok: "bg-green-100 text-green-800 border-green-200",
  unknown: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusDot = {
  expired: "bg-red-500",
  warning: "bg-yellow-500",
  ok: "bg-green-500",
  unknown: "bg-gray-400",
};

export default async function AdminPage() {
  const [activeEmployees, archivedEmployees] = await Promise.all([
    prisma.employee.findMany({ where: { archived: false }, include: { steps: true }, orderBy: { createdAt: "desc" } }),
    prisma.employee.findMany({ where: { archived: true }, include: { steps: true }, orderBy: { createdAt: "desc" } }),
  ]);

  // Parse step 3 data for employee list
  function parseEmployeeCards(emps: typeof activeEmployees): EmployeeCardData[] {
    return emps.map((emp) => {
      const completed = emp.steps.filter((s) => s.status === "COMPLETED").length;
      const step3 = emp.steps.find((s) => s.stepNumber === 3);
      let profilbilde: string | null = null;
      let stilling: string | null = null;
      let kurs: CourseInfo[] = [];
      let hasCvData = false;

      if (step3?.data) {
        try {
          const cvData = JSON.parse(step3.data);
          profilbilde = cvData.profilbilde || null;
          stilling = cvData.stilling || null;
          kurs = (cvData.kurs || []).filter((k: CourseInfo) => k.kursnavn);
          hasCvData = true;
        } catch {
          // Invalid JSON
        }
      }

      return { id: emp.id, name: emp.name, email: emp.email, startDate: emp.startDate, completed, profilbilde, stilling, kurs, hasCvData, archived: emp.archived };
    });
  }

  const activeCards = parseEmployeeCards(activeEmployees);
  const archivedCards = parseEmployeeCards(archivedEmployees);

  // Count expiring/expired courses (active employees only)
  const activeCourses = activeCards.flatMap((e) => e.kurs);
  const expiredCount = activeCourses.filter((k) => getCourseStatus(k.gyldigTil) === "expired").length;
  const warningCount = activeCourses.filter((k) => getCourseStatus(k.gyldigTil) === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Ansatte</h2>
          <p className="text-gray-500 text-sm mt-1">{activeCards.length} aktive</p>
        </div>
        <Link href="/admin/new">
          <Button>+ Ny ansatt</Button>
        </Link>
      </div>

      {/* Course expiry alerts */}
      {(expiredCount > 0 || warningCount > 0) && (
        <div className={`rounded-lg border p-4 ${expiredCount > 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">!</span>
            <div>
              {expiredCount > 0 && (
                <p className="text-sm font-medium text-red-800">{expiredCount} kurs har utlopt</p>
              )}
              {warningCount > 0 && (
                <p className="text-sm font-medium text-yellow-800">{warningCount} kurs utloper innen 6 mnd</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeCards.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            Ingen ansatte ennå. Klikk &quot;+ Ny ansatt&quot; for å legge til den første.
          </p>
        </div>
      ) : (
        <EmployeeGrid employees={activeCards} />
      )}

      {/* Deaktiverte profiler - sammenleggbar seksjon */}
      {archivedCards.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 select-none py-2">
            Deaktiverte profiler ({archivedCards.length})
          </summary>
          <div className="mt-3">
            <EmployeeGrid employees={archivedCards} />
          </div>
        </details>
      )}
    </div>
  );
}

function EmployeeGrid({ employees }: { employees: EmployeeCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {employees.map((emp) => (
        <div key={emp.id} className={`bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${emp.archived ? "border-gray-300 opacity-75" : "border-gray-200 hover:border-navy-300"}`}>
          {/* Header with photo and name */}
          <Link href={`/admin/employee/${emp.id}`}>
            <div className="p-4 pb-3 flex items-center gap-3">
              {emp.profilbilde ? (
                <img
                  src={emp.profilbilde}
                  alt={emp.name}
                  className={`w-12 h-12 rounded-full object-cover border-2 ${emp.archived ? "border-gray-300 grayscale" : "border-gray-200"}`}
                />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${emp.archived ? "bg-gray-100 text-gray-500 border-gray-300" : "bg-navy-100 text-navy-700 border-navy-200"}`}>
                  {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 truncate">{emp.name}</h3>
                <p className="text-sm text-gray-500 truncate">{emp.stilling || emp.email}</p>
              </div>
              {emp.archived && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Arkivert</span>
              )}
            </div>
          </Link>

          {/* Progress */}
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Startdato: {new Date(emp.startDate).toLocaleDateString("nb-NO")}</span>
              <span>{emp.completed}/{STEP_COUNT} steg</span>
            </div>
            <ProgressBar completed={emp.completed} total={STEP_COUNT} showLabel={false} />
          </div>

          {/* Courses - collapsible, only show expired/warning by default */}
          {emp.kurs.length > 0 && (
            <CourseList kurs={emp.kurs} />
          )}

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center gap-2">
            <Link href={`/admin/employee/${emp.id}`} className="text-xs text-navy-700 hover:underline font-medium">
              Detaljer
            </Link>
            {emp.hasCvData && (
              <>
                <span className="text-gray-300">|</span>
                <a href={`/api/cv-generate?employeeId=${emp.id}`} download className="text-xs text-navy-700 hover:underline font-medium">
                  CV Word
                </a>
                <span className="text-gray-300">|</span>
                <a href={`/api/cv-pdf?employeeId=${emp.id}`} download className="text-xs text-navy-700 hover:underline font-medium">
                  CV PDF
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
