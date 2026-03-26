"use client";

import { useState } from "react";
import { CourseEditor } from "@/components/admin/CourseEditor";

interface Course {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
}

export function CourseSection({ employeeId, courses }: { employeeId: string; courses: Course[] }) {
  const [editing, setEditing] = useState(false);

  if (courses.length === 0 && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-navy-700 hover:underline font-medium"
      >
        + Legg til kurs
      </button>
    );
  }

  return (
    <div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-navy-700 hover:underline font-medium mb-2"
        >
          Rediger kurs
        </button>
      )}
      {editing && (
        <CourseEditor
          employeeId={employeeId}
          courses={courses}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
