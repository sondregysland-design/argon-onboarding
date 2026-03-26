import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPPEOrderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { employeeId, shoeSize, coverallSize, tshirtSize } = body;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee)
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  // Check if order already exists (upsert to avoid unique constraint error)
  const existing = await prisma.pPEOrder.findUnique({
    where: { employeeId },
  });

  const order = existing
    ? await prisma.pPEOrder.update({
        where: { employeeId },
        data: { shoeSize, coverallSize, tshirtSize },
      })
    : await prisma.pPEOrder.create({
        data: { employeeId, shoeSize, coverallSize, tshirtSize },
      });

  let emailSent = false;
  try {
    await sendPPEOrderEmail({
      employeeName: employee.name,
      shoeSize,
      coverallSize,
      tshirtSize,
    });
    emailSent = true;
    await prisma.pPEOrder.update({
      where: { id: order.id },
      data: { emailSent: true },
    });
  } catch (e) {
    console.error("Failed to send PPE email:", e);
  }

  // Mark step 2 as completed
  await prisma.onboardingStep.update({
    where: { employeeId_stepNumber: { employeeId, stepNumber: 2 } },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  return NextResponse.json({ ...order, emailSent }, { status: 201 });
}
