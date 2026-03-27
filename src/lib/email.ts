import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom =
  process.env.EMAIL_FROM || "Argon Onboarding <noreply@argonsolutions.no>";

export async function sendWelcomeEmail(employee: {
  name: string;
  email: string;
  phone: string | null;
  startDate: Date;
  token: string;
}) {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.token}`;
  const formattedDate = employee.startDate.toLocaleDateString("nb-NO", {
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
      <div style="background-color: #1E40AF; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Påminnelse</h1>
      </div>
      <div style="padding: 24px; background: #f5f7fa;">
        <p>Hei <strong>${employee.name}</strong>,</p>
        <p>Vi minner deg på at oppstartskurset ditt må fullføres før din startdato. Det tar ikke lang tid, og du kan gjøre det når det passer deg.</p>
        <p>Klikk på knappen under for å fortsette:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${onboardingUrl}" style="background-color: #1E40AF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Fortsett onboarding</a>
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
      <div style="background-color: #1E40AF; padding: 24px; text-align: center;">
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
