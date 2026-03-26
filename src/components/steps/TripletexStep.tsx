"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

const TOPICS = [
  { id: "timer", title: "Timeføring", desc: "Registrer timer og tillegg korrekt i Tripletex" },
  { id: "helligdager", title: "Helligdager", desc: "Forstå regler for jobb og fri på helligdager" },
  { id: "avspasering", title: "Avspasering", desc: "Hvordan søke om og registrere avspasering" },
  { id: "ferie", title: "Ferie", desc: "Søknad i Tripletex og e-post til leder" },
  { id: "sykdom", title: "Sykdom", desc: "Registrering av sykefravær" },
  { id: "avvik", title: "Avviksregistrering", desc: "Rapportering av skade, nestenulykke, tapt eller ødelagt verktøy" },
];

export function TripletexStep({ onComplete, data }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    (data?.checked as Record<string, boolean>) || Object.fromEntries(TOPICS.map((t) => [t.id, false]))
  );

  const allChecked = TOPICS.every((t) => checked[t.id]);
  const checkedCount = TOPICS.filter((t) => checked[t.id]).length;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Les gjennom hvert tema og bekreft at du har forstått prosedyrene.
      </div>
      <div className="space-y-2">
        {TOPICS.map((topic) => (
          <label key={topic.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${checked[topic.id] ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
            <input type="checkbox" checked={checked[topic.id]} onChange={() => toggle(topic.id)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500" />
            <div>
              <p className="font-medium text-sm">{topic.title}</p>
              <p className="text-xs text-gray-500">{topic.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500 text-center">
          {checkedCount} av {TOPICS.length} bekreftet
        </p>
        <Button onClick={() => onComplete({ checked })} className="w-full" disabled={!allChecked}>
          Bekreft og fortsett
        </Button>
      </div>
    </div>
  );
}
