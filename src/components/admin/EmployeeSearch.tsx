"use client";

import { useState } from "react";
import { EmployeeGrid } from "@/components/admin/EmployeeGrid";
import type { EmployeeCardData } from "@/lib/admin-types";

export function EmployeeSearch({ employees }: { employees: EmployeeCardData[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? employees.filter((emp) => {
        const q = query.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          (emp.stilling && emp.stilling.toLowerCase().includes(q))
        );
      })
    : employees;

  return (
    <div className="space-y-4">
      {employees.length > 3 && (
        <div className="relative">
          <input
            type="search"
            placeholder="Sok etter navn, e-post eller stilling..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-300"
            aria-label="Sok etter ansatte"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {query && filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Ingen ansatte matcher &quot;{query}&quot;
        </p>
      ) : (
        <EmployeeGrid employees={filtered} />
      )}
    </div>
  );
}
