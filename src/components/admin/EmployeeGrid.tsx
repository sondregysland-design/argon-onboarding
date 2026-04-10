import Link from "next/link";
import { STEP_COUNT } from "@/lib/steps";
import { ProgressBar } from "@/components/ProgressBar";
import { CourseList } from "@/components/admin/CourseList";
import type { EmployeeCardData } from "@/lib/admin-types";

export function EmployeeGrid({ employees }: { employees: EmployeeCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list">
      {employees.map((emp) => (
        <article
          key={emp.id}
          role="listitem"
          aria-label={`${emp.name} – ${emp.completed}/${STEP_COUNT} steg fullført`}
          className={`bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${emp.archived ? "border-gray-300 opacity-75" : "border-gray-200 hover:border-navy-300"}`}
        >
          <Link href={`/admin/employee/${emp.id}`} aria-label={`Se detaljer for ${emp.name}`}>
            <div className="p-4 pb-3 flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${emp.archived ? "bg-gray-100 text-gray-500 border-gray-300" : "bg-navy-100 text-navy-700 border-navy-200"}`}
                aria-hidden="true"
              >
                {emp.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 truncate">{emp.name}</h3>
                <p className="text-sm text-gray-500 truncate">{emp.stilling || emp.email}</p>
              </div>
              {emp.archived && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Arkivert</span>
              )}
            </div>
          </Link>

          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Startdato: {new Date(emp.startDate).toLocaleDateString("nb-NO")}</span>
              <span aria-label={`${emp.completed} av ${STEP_COUNT} steg fullført`}>
                {emp.completed}/{STEP_COUNT} steg
              </span>
            </div>
            <ProgressBar completed={emp.completed} total={STEP_COUNT} showLabel={false} />
          </div>

          {emp.kurs.length > 0 && (
            <CourseList kurs={emp.kurs} />
          )}

          <div className="px-4 pb-4 flex items-center gap-2">
            <Link href={`/admin/employee/${emp.id}`} className="text-xs text-navy-700 hover:underline font-medium">
              Detaljer
            </Link>
            {emp.hasCvData && (
              <>
                <span className="text-gray-300" aria-hidden="true">|</span>
                <a
                  href={`/api/cv-generate?employeeId=${emp.id}`}
                  download
                  className="text-xs text-navy-700 hover:underline font-medium"
                  aria-label={`Last ned CV som Word for ${emp.name}`}
                >
                  CV Word
                </a>
                <span className="text-gray-300" aria-hidden="true">|</span>
                <a
                  href={`/api/cv-pdf?employeeId=${emp.id}`}
                  download
                  className="text-xs text-navy-700 hover:underline font-medium"
                  aria-label={`Last ned CV som PDF for ${emp.name}`}
                >
                  CV PDF
                </a>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
