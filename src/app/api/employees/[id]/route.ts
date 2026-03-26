import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { steps: { orderBy: { stepNumber: "asc" } }, ppeOrder: true },
  });
  if (!employee)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(employee);
}

// Soft-delete: archive employee instead of deleting
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.employee.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ success: true });
}

// Toggle archive status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (typeof body.archived === "boolean") {
    const employee = await prisma.employee.update({
      where: { id },
      data: { archived: body.archived },
    });
    return NextResponse.json(employee);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
