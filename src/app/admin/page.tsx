import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { EmployeeSearch } from "@/components/admin/EmployeeSearch";
import { EmployeeGrid } from "@/components/admin/EmployeeGrid";
import type { CourseInfo, EmployeeCardData } from "@/lib/admin-types";

export const dynamic = "force-dynamic";

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

export default async function AdminPage() {
  const [activeEmployees, archivedEmployees] = await Promise.all([
    prisma.employee.findMany({ where: { archived: false }, include: { steps: true }, orderBy: { createdAt: "desc" } }),
    prisma.employee.findMany({ where: { archived: true }, include: { steps: true }, orderBy: { createdAt: "desc" } }),
  ]);

  function parseEmployeeCards(emps: typeof activeEmployees): EmployeeCardData[] {
    return emps.map((emp) => {
      const completed = emp.steps.filter((s) => s.status === "COMPLETED").length;
      const step3 = emp.steps.find((s) => s.stepNumber === 3);
      let hasProfileImage = false;
      let stilling: string | null = null;
      let kurs: CourseInfo[] = [];
      let hasCvData = false;

      if (step3?.data) {
        try {
          const cvData = JSON.parse(step3.data);
          hasProfileImage = !!cvData.profilbilde;
          stilling = cvData.stilling || null;
          kurs = (cvData.kurs || []).filter((k: CourseInfo) => k.kursnavn);
          hasCvData = true;
        } catch {
          // Invalid JSON
        }
      }

      const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        startDate: emp.startDate.toISOString(),
        completed,
        hasProfileImage,
        initials,
        stilling,
        kurs,
        hasCvData,
        archived: emp.archived,
      };
    });
  }

  const activeCards = parseEmployeeCards(activeEmployees);
  const archivedCards = parseEmployeeCards(archivedEmployees);

  const activeCourses = activeCards.flatMap((e) => e.kurs);
  const expiredCount = activeCourses.filter((k) => getCourseStatus(k.gyldigTil) === "expired").length;
  const warningCount = activeCourses.filter((k) => getCourseStatus(k.gyldigTil) === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Ansatte</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCards.length} aktive{archivedCards.length > 0 && `, ${archivedCards.length} arkiverte`}
          </p>
        </div>
        <Link href="/admin/new">
          <Button>+ Ny ansatt</Button>
        </Link>
      </div>

      {(expiredCount > 0 || warningCount > 0) && (
        <div
          role="alert"
          className={`rounded-lg border p-4 ${expiredCount > 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">!</span>
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
        <EmployeeSearch employees={activeCards} />
      )}

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
