import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { STEP_COUNT } from "@/lib/steps";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { steps: true, ppeOrder: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, startDate } = body;

  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      phone: phone || null,
      startDate: new Date(startDate),
      steps: {
        create: Array.from({ length: STEP_COUNT }, (_, i) => ({
          stepNumber: i + 1,
          status: "NOT_STARTED",
        })),
      },
    },
    include: { steps: true },
  });

  // Send welcome email with onboarding link
  try {
    await sendWelcomeEmail({
      name: employee.name,
      email,
      token: employee.token,
    });
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return NextResponse.json(employee, { status: 201 });
}
