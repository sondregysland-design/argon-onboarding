import { STEPS } from "@/lib/steps";

interface StepIndicatorProps {
  currentStep: number;
  stepStatuses: Record<number, string>;
  onStepClick?: (stepNumber: number) => void;
  canNavigateTo?: (stepNumber: number) => boolean;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "COMPLETED": return "fullført";
    case "IN_PROGRESS": return "pågår";
    default: return "ikke startet";
  }
}

export function StepIndicator({ currentStep, stepStatuses, onStepClick, canNavigateTo }: StepIndicatorProps) {
  function isClickable(stepNumber: number): boolean {
    if (!onStepClick) return false;
    if (canNavigateTo) return canNavigateTo(stepNumber);
    // Fallback: allow completed steps and current step
    return stepStatuses[stepNumber] === "COMPLETED" || stepNumber === currentStep;
  }

  return (
    <nav aria-label="Onboarding-progresjon" className="w-full">
      {/* Mobile: compact dot view */}
      <div className="sm:hidden text-center space-y-3">
        <p className="text-sm font-medium text-navy-900">
          Steg {currentStep} av {STEPS.length}: {STEPS[currentStep - 1].name}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((step) => {
            const status = stepStatuses[step.number] || "NOT_STARTED";
            const isCurrent = step.number === currentStep;
            const isCompleted = status === "COMPLETED";
            const clickable = isClickable(step.number);

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => clickable && onStepClick?.(step.number)}
                disabled={!clickable}
                aria-label={`Steg ${step.number}: ${step.name}, ${getStatusLabel(status)}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-3 h-3 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-green-700"
                    : isCurrent
                    ? "bg-navy-900 ring-2 ring-navy-300 ring-offset-1"
                    : "bg-gray-300"
                } ${clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: full stepper */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const status = stepStatuses[step.number] || "NOT_STARTED";
          const isCurrent = step.number === currentStep;
          const isCompleted = status === "COMPLETED";
          const clickable = isClickable(step.number);

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => clickable && onStepClick?.(step.number)}
                  disabled={!clickable}
                  aria-label={`Steg ${step.number}: ${step.name}, ${getStatusLabel(status)}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-green-700 text-white cursor-pointer hover:bg-green-800"
                      : isCurrent
                      ? "bg-navy-900 text-white"
                      : clickable
                      ? "bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? "✓" : step.number}
                </button>
                <span className={`text-xs mt-1 ${isCurrent ? "text-navy-900 font-medium" : "text-gray-500"}`}>
                  {step.name}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 lg:w-12 h-0.5 mx-1 ${isCompleted ? "bg-green-700" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
