"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface StepActionsProps {
  employeeId: string;
  stepNumber: number;
  status: string;
}

export function StepActions({ employeeId, stepNumber, status }: StepActionsProps) {
  const router = useRouter();

  async function markCompleted() {
    await fetch(`/api/steps/${employeeId}/${stepNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    router.refresh();
  }

  async function resetStep() {
    await fetch(`/api/steps/${employeeId}/${stepNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "NOT_STARTED" }),
    });
    router.refresh();
  }

  if (status === "COMPLETED") {
    return (
      <Button variant="outline" size="sm" onClick={resetStep}>
        Tilbakestill
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={markCompleted}>
      Merk fullført
    </Button>
  );
}
