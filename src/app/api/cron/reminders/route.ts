import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { STEP_COUNT } from "@/lib/steps";
import { sendReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const reminderDate = new Date(now);
  reminderDate.setDate(reminderDate.getDate() + 21); // 3 weeks from now

  // Find employees whose start date is ~21 days from now (+-1 day buffer)
  const dayBefore = new Date(reminderDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter = new Date(reminderDate);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const employees = await prisma.employee.findMany({
    where: {
      archived: false,
      reminderSentAt: null,
      startDate: {
        gte: dayBefore,
        lte: dayAfter,
      },
    },
    include: {
      steps: true,
    },
  });

  let sentCount = 0;

  for (const employee of employees) {
    const completedSteps = employee.steps.filter(
      (s) => s.status === "COMPLETED"
    ).length;

    // Only send reminder if not all steps are completed
    if (completedSteps < STEP_COUNT) {
      try {
        await sendReminderEmail({
          name: employee.name,
          email: employee.email,
          token: employee.token,
        });
        await prisma.employee.update({
          where: { id: employee.id },
          data: { reminderSentAt: new Date() },
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send reminder to ${employee.name}:`, e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    remindersSent: sentCount,
    checked: employees.length,
  });
}
