"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/StepIndicator";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { PersonalInfoStep } from "@/components/steps/PersonalInfoStep";
import { PPEOrderStep } from "@/components/steps/PPEOrderStep";
import { CVStep } from "@/components/steps/CVStep";
import { TechnicalReviewStep } from "@/components/steps/TechnicalReviewStep";
import { QuizStep } from "@/components/steps/QuizStep";
import { TripletexStep } from "@/components/steps/TripletexStep";
import { GeneralInfoStep } from "@/components/steps/GeneralInfoStep";
import { VideoLibraryStep } from "@/components/steps/VideoLibraryStep";

interface Step {
  number: number;
  name: string;
  description: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  data: Record<string, unknown> | null;
}

interface Props {
  employeeId: string;
  employeeName: string;
  steps: Step[];
  initialStep: number;
  ppeOrder: { shoeSize: string; coverallSize: string; tshirtSize: string } | null;
}

export function OnboardingWizard({ employeeId, employeeName, steps: initialSteps, initialStep, ppeOrder }: Props) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>(
    Object.fromEntries(initialSteps.map((s) => [s.number, s.status]))
  );
  const [allComplete, setAllComplete] = useState(
    initialSteps.every((s) => s.status === "COMPLETED")
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const step = initialSteps.find((s) => s.number === currentStep)!;
  const stepStatus = localStatuses[currentStep] || "NOT_STARTED";

  async function completeStep(data?: Record<string, unknown>) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/steps/${employeeId}/${currentStep}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", data }),
      });

      if (!res.ok) throw new Error("Kunne ikke lagre steget");

      const newStatuses = { ...localStatuses, [currentStep]: "COMPLETED" };
      setLocalStatuses(newStatuses);

      const allDone = Object.values(newStatuses).every((s) => s === "COMPLETED");
      if (allDone) {
        setAllComplete(true);
      } else if (currentStep < 8) {
        setCurrentStep(currentStep + 1);
      }

      router.refresh();
    } catch {
      setError("Noe gikk galt ved lagring. Sjekk nettverkstilkoblingen og prøv igjen.");
    } finally {
      setSaving(false);
    }
  }

  function canNavigateTo(stepNum: number): boolean {
    if (stepNum < 1 || stepNum > 8) return false;
    for (let i = 1; i < stepNum; i++) {
      if (localStatuses[i] !== "COMPLETED") return false;
    }
    return true;
  }

  function renderStep() {
    const props = { employeeId, onComplete: completeStep, data: step.data };
    switch (currentStep) {
      case 1: return <PersonalInfoStep {...props} />;
      case 2: return <PPEOrderStep {...props} existingOrder={ppeOrder} />;
      case 3: return <CVStep {...props} />;
      case 4: return <TechnicalReviewStep {...props} />;
      case 5: return <QuizStep {...props} />;
      case 6: return <TripletexStep {...props} />;
      case 7: return <GeneralInfoStep {...props} />;
      case 8: return <VideoLibraryStep {...props} />;
      default: return null;
    }
  }

  if (allComplete) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">&#127881;</div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Gratulerer, {employeeName}!</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Du har fullført alle onboarding-stegene. Velkommen til teamet! Din leder vil ta kontakt med videre informasjon.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => {
              setAllComplete(false);
              setCurrentStep(3);
            }}>
              Rediger CV
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <StepIndicator
        currentStep={currentStep}
        stepStatuses={localStatuses}
        canNavigateTo={canNavigateTo}
        onStepClick={(num) => setCurrentStep(num)}
      />

      <Card>
        <h3 className="text-lg font-bold text-navy-900 mb-1">{step.name}</h3>
        <p className="text-sm text-gray-500 mb-6">{step.description}</p>

        {saving ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Lagrer...</p>
          </div>
        ) : stepStatus === "COMPLETED" ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-green-800 font-medium">&#10003; Dette steget er fullført</p>
            <Button variant="outline" size="sm" onClick={() => {
              if (!confirm("Er du sikker på at du vil redigere dette steget? Dataene du har fylt ut vil bli slettet.")) return;
              const newStatuses = { ...localStatuses, [currentStep]: "NOT_STARTED" };
              setLocalStatuses(newStatuses);
              fetch(`/api/steps/${employeeId}/${currentStep}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "NOT_STARTED" }),
              });
              router.refresh();
            }}>
              Rediger dette steget
            </Button>
          </div>
        ) : (
          renderStep()
        )}
      </Card>

      <div className="flex justify-between print:hidden">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            &larr; Forrige
          </Button>
        ) : (
          <div />
        )}
        <div className="relative group">
          <Button
            variant="outline"
            onClick={() => canNavigateTo(currentStep + 1) && setCurrentStep(currentStep + 1)}
            disabled={currentStep === 8 || !canNavigateTo(currentStep + 1)}
          >
            Neste &rarr;
          </Button>
          {(currentStep === 8 || !canNavigateTo(currentStep + 1)) && (
            <span className="absolute -top-8 right-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Fullfør dette steget først
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
