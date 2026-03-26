import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCVDocument } from "@/lib/cv-template";

export async function GET(request: NextRequest) {
  const employeeId = request.nextUrl.searchParams.get("employeeId");
  if (!employeeId) {
    return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { steps: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const step3 = employee.steps.find((s) => s.stepNumber === 3);
  if (!step3?.data) {
    return NextResponse.json({ error: "CV not completed" }, { status: 404 });
  }

  const cvData = JSON.parse(step3.data);
  cvData.name = employee.name;

  const buffer = await generateCVDocument(cvData);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="CV - ${employee.name}.docx"`,
    },
  });
}
