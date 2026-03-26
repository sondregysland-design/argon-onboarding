"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

const INFO_SECTIONS = [
  { title: "Kontaktinformasjon", items: ["Nærmeste leder", "Verneombud", "Tillitsvalgt"] },
  { title: "Forsikringsordninger", items: ["Yrkesskadeforsikring", "Reiseforsikring", "Gruppeliv"] },
  { title: "Aktuelle apper", items: ["Tripletex", "Teams", "SharePoint"] },
  { title: "Velferdstilbud", items: ["Sauna", "Båtklubb", "Bruk av lokaler"] },
];

export function GeneralInfoStep({ onComplete }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-4">
      {INFO_SECTIONS.map((section) => (
        <div key={section.title} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-navy-900 mb-2">{section.title}</h4>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-navy-300 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500" />
        <span className="text-sm font-medium">Jeg har lest og forstått all informasjon over</span>
      </label>

      <Button onClick={() => onComplete({ confirmedAt: new Date().toISOString() })} className="w-full" disabled={!confirmed}>
        Bekreft og fortsett
      </Button>
    </div>
  );
}
