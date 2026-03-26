"use client";

import { useState } from "react";

interface CourseInfo {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
  pdfBase64?: string;
  pdfName?: string;
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

const statusColors: Record<string, string> = {
  expired: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ok: "bg-green-100 text-green-800 border-green-200",
  unknown: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusDot: Record<string, string> = {
  expired: "bg-red-500",
  warning: "bg-yellow-500",
  ok: "bg-green-500",
  unknown: "bg-gray-400",
};

export function CourseList({ kurs }: { kurs: CourseInfo[] }) {
  const [expanded, setExpanded] = useState(false);

  const alertCourses = kurs.filter((k) => {
    const s = getCourseStatus(k.gyldigTil);
    return s === "expired" || s === "warning";
  });
  const okCourses = kurs.filter((k) => {
    const s = getCourseStatus(k.gyldigTil);
    return s === "ok" || s === "unknown";
  });

  const visibleCourses = expanded ? kurs : alertCourses;

  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kurs / Sertifikater</p>

      {visibleCourses.length > 0 && (
        <div className="space-y-1">
          {visibleCourses.map((k, i) => {
            const status = getCourseStatus(k.gyldigTil);
            return (
              <div key={i} className={`flex items-center justify-between text-xs rounded-md px-2 py-1 border ${statusColors[status]}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[status]}`} />
                  <span className="truncate">{k.kursnavn}</span>
                </div>
                {k.pdfBase64 && (
                  <a
                    href={k.pdfBase64}
                    download={k.pdfName || "sertifikat.pdf"}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 ml-1 text-blue-600 hover:text-blue-800"
                    title="Last ned PDF"
                  >
                    PDF
                  </a>
                )}
                <span className="flex-shrink-0 ml-2">{formatCourseDate(k.gyldigTil)}</span>
              </div>
            );
          })}
        </div>
      )}

      {alertCourses.length === 0 && !expanded && (
        <p className="text-xs text-green-600 mb-1">Alle {okCourses.length} kurs er gyldige</p>
      )}

      {okCourses.length > 0 && (
        <button
          onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
          className="text-xs text-navy-600 hover:text-navy-800 mt-1.5 font-medium"
        >
          {expanded ? "Skjul gyldige kurs" : `Vis alle kurs (${kurs.length})`}
        </button>
      )}
    </div>
  );
}
