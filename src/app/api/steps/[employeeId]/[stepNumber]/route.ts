import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { STEP_COUNT } from "@/lib/steps";
import { sendCompletionEmail } from "@/lib/email";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ employeeId: string; stepNumber: string }> }
) {
  const { employeeId, stepNumber } = await params;
  const body = await request.json();
  const { status, data } = body;

  const step = await prisma.onboardingStep.update({
    where: {
      employeeId_stepNumber: {
        employeeId,
        stepNumber: parseInt(stepNumber),
      },
    },
    data: {
      status,
      data: data ? JSON.stringify(data) : undefined,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    },
  });

  // Check if all steps are now completed and send completion email
  if (status === "COMPLETED") {
    const completedCount = await prisma.onboardingStep.count({
      where: { employeeId, status: "COMPLETED" },
    });

    if (completedCount === STEP_COUNT) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
      });

      if (employee && !employee.completionEmailSentAt) {
        try {
          await sendCompletionEmail({
            name: employee.name,
            email: employee.email,
          });
          await prisma.employee.update({
            where: { id: employeeId },
            data: { completionEmailSentAt: new Date() },
          });
        } catch (e) {
          console.error("Failed to send completion email:", e);
        }
      }
    }
  }

  return NextResponse.json(step);
}
