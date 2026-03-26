"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

const CHECKLIST_ITEMS = [
  "Gjennomgått generelle tekniske løsninger",
  "Forstått praktiske arbeidsmetoder",
  "Gjennomgått avvik og 'lessons learned'",
  "Forstått rapporteringsprosedyrer",
  "Forstått HMS-rutiner på arbeidsplassen",
];

export function TechnicalReviewStep({ onComplete, data }: Props) {
  const [checked, setChecked] = useState<boolean[]>(
    (data?.checked as boolean[]) || CHECKLIST_ITEMS.map(() => false)
  );

  const allChecked = checked.every(Boolean);

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (allChecked) onComplete({ checked, completedAt: new Date().toISOString() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        Gå gjennom punktene under og bekreft at du har forstått innholdet. Alle punkter må bekreftes.
      </div>
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item, i) => (
          <label key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500" />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500 text-center">
          {checked.filter(Boolean).length} av {CHECKLIST_ITEMS.length} bekreftet
        </p>
        <Button type="submit" className="w-full" disabled={!allChecked}>
          Bekreft og fortsett
        </Button>
      </div>
    </form>
  );
}
