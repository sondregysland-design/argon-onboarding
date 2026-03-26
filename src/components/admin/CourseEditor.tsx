"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Course {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
  pdfBase64?: string;
  pdfName?: string;
}

interface Props {
  employeeId: string;
  courses: Course[];
  onClose: () => void;
}

export function CourseEditor({ employeeId, courses: initialCourses, onClose }: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function updateCourse(index: number, field: keyof Course, value: string) {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  }

  function removeCourse(index: number) {
    setCourses(courses.filter((_, i) => i !== index));
  }

  function addCourse() {
    setCourses([...courses, { kursnavn: "", gyldigFra: "", gyldigTil: "" }]);
  }

  async function save() {
    setSaving(true);
    try {
      // Fetch current step 3 data, merge courses, save back
      const res = await fetch(`/api/employees/${employeeId}`);
      const emp = await res.json();
      const step3 = emp.steps?.find((s: { stepNumber: number }) => s.stepNumber === 3);

      let stepData: Record<string, unknown> = {};
      if (step3?.data) {
        try { stepData = JSON.parse(step3.data); } catch { /* ignore */ }
      }

      stepData.kurs = courses;

      await fetch(`/api/steps/${employeeId}/3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: stepData }),
      });

      router.refresh();
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <h4 className="text-sm font-semibold text-navy-900">Rediger kurs / sertifikater</h4>

      {courses.map((course, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
          <div>
            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Kursnavn</label>}
            <input
              type="text"
              value={course.kursnavn}
              onChange={(e) => updateCourse(i, "kursnavn", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
              placeholder="Kursnavn"
            />
          </div>
          <div>
            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Gyldig fra</label>}
            <input
              type="date"
              value={course.gyldigFra}
              onChange={(e) => updateCourse(i, "gyldigFra", e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>
          <div>
            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Gyldig til</label>}
            <input
              type="date"
              value={course.gyldigTil}
              onChange={(e) => updateCourse(i, "gyldigTil", e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>
          <div className="flex items-center gap-1">
            {course.pdfBase64 && (
              <a
                href={course.pdfBase64}
                download={course.pdfName || "sertifikat.pdf"}
                className="px-2 py-1.5 text-sm text-blue-600 hover:text-blue-800"
                title={course.pdfName || "Last ned PDF"}
              >
                PDF
              </a>
            )}
            <button
              onClick={() => removeCourse(i)}
              className="px-2 py-1.5 text-sm text-red-500 hover:text-red-700"
              title="Fjern kurs"
            >
              X
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCourse} className="text-sm text-navy-700 hover:underline font-medium">
        + Legg til kurs
      </button>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 text-sm font-medium bg-navy-700 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50"
        >
          {saving ? "Lagrer..." : "Lagre endringer"}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
          Avbryt
        </button>
      </div>
    </div>
  );
}
