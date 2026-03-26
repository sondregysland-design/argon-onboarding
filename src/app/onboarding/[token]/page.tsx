import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEPS } from "@/lib/steps";
import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const employee = await prisma.employee.findUnique({
    where: { token },
    include: { steps: { orderBy: { stepNumber: "asc" } }, ppeOrder: true },
  });

  if (!employee) notFound();

  const stepsData = STEPS.map((step) => {
    const empStep = employee.steps.find((s) => s.stepNumber === step.number);
    return {
      ...step,
      status: (empStep?.status || "NOT_STARTED") as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
      data: empStep?.data ? JSON.parse(empStep.data) : null,
    };
  });

  const currentStep = stepsData.find((s) => s.status !== "COMPLETED")?.number || 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900">Velkommen, {employee.name}!</h2>
        <p className="text-gray-500 mt-1">Fullfør onboarding-stegene under for å komme i gang.</p>
      </div>
      <OnboardingWizard
        employeeId={employee.id}
        employeeName={employee.name}
        steps={stepsData}
        initialStep={currentStep}
        ppeOrder={employee.ppeOrder}
      />
    </div>
  );
}
