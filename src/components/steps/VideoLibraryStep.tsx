"use client";

import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

export function VideoLibraryStep({ onComplete }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">&#127916;</div>
        <h4 className="text-lg font-medium text-navy-900 mb-2">Videobibliotek</h4>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Opplæringsvideoer kommer snart. Kontakt din leder for mer informasjon om tilgjengelige videoressurser.
        </p>
      </div>
      <Button
        onClick={() => onComplete({ acknowledgedAt: new Date().toISOString() })}
        className="w-full"
        variant="secondary"
      >
        Jeg har notert meg dette — fullfør onboarding
      </Button>
    </div>
  );
}
