import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom =
  process.env.EMAIL_FROM || "Onboarding <noreply@argonsolutions.no>";

export async function sendWelcomeEmail(employee: {
  name: string;
  email: string;
  token: string;
}) {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.token}`;

  await resend.emails.send({
    from: emailFrom,
    to: employee.email,
    subject: "Velkommen — Start ditt oppstartskurs",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e3a5f; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Velkommen om bord!</h1>
      </div>
      <div style="padding: 24px; background: #f5f7fa;">
        <p>Hei <strong>${employee.name}</strong>,</p>
        <p>Vi gleder oss til å ha deg med på laget! For å komme i gang må du fullføre oppstartskurset vårt.</p>
        <p>Klikk på knappen under for å starte:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${onboardingUrl}" style="background-color: #1e3a5f; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Start onboarding</a>
        </div>
        <p style="color: #666; font-size: 14px;">Eller kopier denne lenken:</p>
        <p style="background: white; padding: 12px; border-radius: 4px; font-size: 13px; word-break: break-all; border: 1px solid #ddd;">${onboardingUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Denne lenken er personlig og skal ikke deles med andre.</p>
      </div>
    </div>`,
  });
}

export async function sendPPEOrderEmail(order: {
  employeeName: string;
  shoeSize: string;
  coverallSize: string;
  tshirtSize: string;
}) {
  await resend.emails.send({
    from: emailFrom,
    to: process.env.EMAIL_RECIPIENT!,
    subject: `Verneutstyrsbestilling — ${order.employeeName}`,
    html: `
    <h2>Ny verneutstyrsbestilling</h2>
    <p><strong>Ansatt:</strong> ${order.employeeName}</p>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr><td><strong>Skostørrelse</strong></td><td>${order.shoeSize}</td></tr>
      <tr><td><strong>Kjeledress</strong></td><td>${order.coverallSize}</td></tr>
      <tr><td><strong>T-skjorte</strong></td><td>${order.tshirtSize}</td></tr>
    </table>
    <p>Bedriften følger kundens retningslinjer for bruk av verneutstyr.</p>`,
  });
}

export async function sendReminderEmail(employee: {
  name: string;
  email: string;
  token: string;
}) {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.token}`;

  await resend.emails.send({
    from: emailFrom,
    to: employee.email,
    subject: "Påminnelse — Fullfør oppstartskurset ditt",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e3a5f; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Påminnelse</h1>
      </div>
      <div style="padding: 24px; background: #f5f7fa;">
        <p>Hei <strong>${employee.name}</strong>,</p>
        <p>Vi minner deg på at oppstartskurset ditt må fullføres før din startdato. Det tar ikke lang tid, og du kan gjøre det når det passer deg.</p>
        <p>Klikk på knappen under for å fortsette:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${onboardingUrl}" style="background-color: #1e3a5f; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Fortsett onboarding</a>
        </div>
        <p style="color: #666; font-size: 14px;">Eller kopier denne lenken:</p>
        <p style="background: white; padding: 12px; border-radius: 4px; font-size: 13px; word-break: break-all; border: 1px solid #ddd;">${onboardingUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Denne lenken er personlig og skal ikke deles med andre.</p>
      </div>
    </div>`,
  });
}

export async function sendCompletionEmail(employee: {
  name: string;
  email: string;
}) {
  await resend.emails.send({
    from: emailFrom,
    to: employee.email,
    subject: "Gratulerer — Oppstartskurset er fullført!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e3a5f; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Gratulerer!</h1>
      </div>
      <div style="padding: 24px; background: #f5f7fa;">
        <p>Hei <strong>${employee.name}</strong>,</p>
        <p>Du har fullført alle stegene i oppstartskurset. Vi ser frem til å jobbe sammen med deg!</p>
        <p>Hvis du har spørsmål, er det bare å ta kontakt med din nærmeste leder.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Lykke til med oppstarten!</p>
      </div>
    </div>`,
  });
}
