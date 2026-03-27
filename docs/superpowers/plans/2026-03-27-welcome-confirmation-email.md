# Welcome Confirmation Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a new employee is created, send a formal welcome email that displays their registered info (name, email, phone, start date), congratulates them, and asks them to confirm the info is correct by replying to post@argonsolutions.no.

**Architecture:** Modify the existing `sendWelcomeEmail` function to accept phone and startDate, update the HTML template to show a formatted info table with confirmation instructions, and pass the additional fields from the API route.

**Tech Stack:** Resend (email), Next.js API routes, Prisma

---

### File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/email.ts:7-36` | Modify | Update `sendWelcomeEmail` signature and HTML template |
| `src/app/api/employees/route.ts:36-39` | Modify | Pass phone and startDate to `sendWelcomeEmail` |

---

### Task 1: Update sendWelcomeEmail function signature and template

**Files:**
- Modify: `src/lib/email.ts:7-36`

- [ ] **Step 1: Update the function signature to accept phone and startDate**

In `src/lib/email.ts`, replace the `sendWelcomeEmail` function (lines 7-36) with:

```typescript
export async function sendWelcomeEmail(employee: {
  name: string;
  email: string;
  phone: string | null;
  startDate: Date;
  token: string;
}) {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.token}`;
  const formattedDate = new Date(employee.startDate).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await resend.emails.send({
    from: emailFrom,
    replyTo: "post@argonsolutions.no",
    to: employee.email,
    subject: "Velkommen til Argon Solutions — Bekreft dine opplysninger",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1E40AF; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Velkommen til Argon Solutions!</h1>
      </div>
      <div style="padding: 24px; background: #f5f7fa;">
        <p>Hei <strong>${employee.name}</strong>,</p>
        <p>Vi er glade for å ønske deg velkommen som en del av teamet vårt! Vi ser virkelig frem til å ha deg med på laget.</p>

        <p>Vi har registrert følgende opplysninger om deg:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; font-weight: bold; color: #374151; width: 140px;">Navn</td>
            <td style="padding: 12px 16px; color: #1E293B;">${employee.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; font-weight: bold; color: #374151;">E-post</td>
            <td style="padding: 12px 16px; color: #1E293B;">${employee.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Telefon</td>
            <td style="padding: 12px 16px; color: #1E293B;">${employee.phone || "Ikke oppgitt"}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Startdato</td>
            <td style="padding: 12px 16px; color: #1E293B;">${formattedDate}</td>
          </tr>
        </table>

        <p>Vennligst bekreft at opplysningene ovenfor er korrekte ved å svare på denne e-posten, eller send en e-post til <a href="mailto:post@argonsolutions.no" style="color: #1E40AF; font-weight: bold;">post@argonsolutions.no</a>.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <p>For å komme i gang med oppstartskurset ditt, klikk på knappen under:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${onboardingUrl}" style="background-color: #1E40AF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Start onboarding</a>
        </div>
        <p style="color: #666; font-size: 14px;">Eller kopier denne lenken:</p>
        <p style="background: white; padding: 12px; border-radius: 4px; font-size: 13px; word-break: break-all; border: 1px solid #ddd;">${onboardingUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Denne lenken er personlig og skal ikke deles med andre.</p>
      </div>
    </div>`,
  });
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd "c:/Users/sondr/Google/argon-onboarding" && npx tsc --noEmit 2>&1 | head -20
```

Expected: Type error in `src/app/api/employees/route.ts` because `sendWelcomeEmail` now requires `phone` and `startDate`.

- [ ] **Step 3: Commit the email template change**

```bash
cd "c:/Users/sondr/Google/argon-onboarding"
git add src/lib/email.ts
git commit -m "feat: update welcome email with employee info and confirmation request"
```

---

### Task 2: Pass phone and startDate from API route

**Files:**
- Modify: `src/app/api/employees/route.ts:35-40`

- [ ] **Step 1: Update the sendWelcomeEmail call to include phone and startDate**

In `src/app/api/employees/route.ts`, replace lines 35-40:

```typescript
  // Send welcome email with onboarding link
  try {
    await sendWelcomeEmail({
      name: employee.name,
      email,
      token: employee.token,
    });
```

with:

```typescript
  // Send welcome email with info confirmation and onboarding link
  try {
    await sendWelcomeEmail({
      name: employee.name,
      email,
      phone: employee.phone,
      startDate: employee.startDate,
      token: employee.token,
    });
```

- [ ] **Step 2: Verify build passes**

```bash
cd "c:/Users/sondr/Google/argon-onboarding" && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with all routes compiled.

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/sondr/Google/argon-onboarding"
git add src/app/api/employees/route.ts
git commit -m "feat: pass employee phone and startDate to welcome email"
```

---

### Task 3: Deploy and verify

- [ ] **Step 1: Deploy to Vercel**

```bash
cd "c:/Users/sondr/Google/argon-onboarding" && vercel --prod 2>&1 | tail -5
```

Expected: Deployment succeeds, aliased to argon-onboarding.vercel.app.

- [ ] **Step 2: Test by creating a new employee**

Go to https://argon-onboarding.vercel.app/admin/new, fill in:
- Name: test name
- Email: your test email
- Phone: a test phone number
- Start date: a future date

Verify the received email:
1. Subject is "Velkommen til Argon Solutions — Bekreft dine opplysninger"
2. Shows employee info table (name, email, phone, start date)
3. Asks to confirm by replying to post@argonsolutions.no
4. Has `reply-to: post@argonsolutions.no` header
5. Still includes the onboarding link button

- [ ] **Step 3: Commit plan document**

```bash
cd "c:/Users/sondr/Google/argon-onboarding"
git add docs/superpowers/plans/
git commit -m "docs: add welcome confirmation email implementation plan"
```
