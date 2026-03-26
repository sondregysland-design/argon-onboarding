# E-post-automatisering for Onboarding-appen

## Kontekst

Onboarding-appen bruker Resend for e-postutsending, men sender fra `onboarding@resend.dev` (sandbox) som kun kan levere til verifiserte adresser. Brukeren har nå kjopt domenet **argonsolutions.no** (registrert via domene.no) og onsker:

1. E-poster sendt fra eget domene (`noreply@argonsolutions.no`)
2. Automatisk paminnelse-e-post 3 uker for startdato
3. Automatisk fullfort-e-post nar alle 8 steg er fullfort
4. At produksjonslenker i e-poster peker til riktig URL

## Scope

### 1. Domene-verifisering (Resend + domene.no)

**Manuelt steg** (ikke kode):
- Legge til `argonsolutions.no` i Resend Dashboard > Domains
- Resend genererer DNS-poster (MX, SPF, DKIM)
- Legge inn disse DNS-postene i domene.no sitt kontrollpanel
- Verifisere domenet i Resend

### 2. Kode-endringer i `src/lib/email.ts`

**Oppdater avsender-adresse:**
- Endre `from: "Onboarding <onboarding@resend.dev>"` til `from: "Onboarding <noreply@argonsolutions.no>"` (bruk env-variabel `EMAIL_FROM`)

**Ny funksjon: `sendReminderEmail()`**
- Tar imot ansatt-objekt (navn, email, token)
- Sender pamoinnelse med lenke til onboarding
- Norsk tekst: "Hei {navn}, vi minner deg pa at oppstartskurset ditt ma fullframes for startdato. Klikk her for a fortsette."

**Ny funksjon: `sendCompletionEmail()`**
- Tar imot ansatt-objekt (navn, email)
- Sender gratulasjon pa norsk
- Informerer om at onboarding er fullfort

### 3. Vercel Cron for paminnelser

**Ny fil:** `src/app/api/cron/reminders/route.ts`

Logikk:
```
GET /api/cron/reminders (autorisert med CRON_SECRET)
1. Finn alle ansatte der:
   - archived = false
   - startDate er om 21 dager (+-1 dag buffer)
   - reminderSentAt er null
   - Ikke alle steg er COMPLETED
2. For hver: send paminnelse-e-post
3. Oppdater reminderSentAt pa ansatten
```

**Ny fil:** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 8 * * *"
  }]
}
```

Kjorer kl. 08:00 UTC daglig. Sikres med `CRON_SECRET` env-variabel.

### 4. Fullfort-e-post trigger

**Endre fil:** `src/app/api/steps/[employeeId]/[stepNumber]/route.ts`

Etter oppdatering av et steg til COMPLETED:
1. Sjekk om alle 8 steg na er COMPLETED
2. Sjekk at `completionEmailSentAt` er null (unnga duplikater)
3. Hvis ja: send fullfort-e-post og sett `completionEmailSentAt`

### 5. Database-migrering

**Endre fil:** `prisma/schema.prisma`

Legg til pa Employee-modellen:
```prisma
reminderSentAt       DateTime?
completionEmailSentAt DateTime?
```

Kjor `npx prisma migrate dev --name add-email-tracking-fields`

### 6. Miljovariabel-oppdateringer

**Lokal `.env`:**
```
EMAIL_FROM="Onboarding <noreply@argonsolutions.no>"
NEXT_PUBLIC_APP_URL="https://onboarding-app-pi-lovat.vercel.app"
CRON_SECRET="<generert-hemmelighet>"
```

**Vercel Environment Variables (via CLI eller dashboard):**
- `EMAIL_FROM` = `Onboarding <noreply@argonsolutions.no>`
- `NEXT_PUBLIC_APP_URL` = `https://onboarding-app-pi-lovat.vercel.app`
- `CRON_SECRET` = `<generert-hemmelighet>`
- Bekreft at `RESEND_API_KEY` og `EMAIL_RECIPIENT` allerede er satt

## Filer som endres

| Fil | Endring |
|-----|---------|
| `src/lib/email.ts` | Oppdater `from`, legg til `sendReminderEmail()` og `sendCompletionEmail()` |
| `src/app/api/steps/[employeeId]/[stepNumber]/route.ts` | Trigger fullfort-e-post |
| `src/app/api/cron/reminders/route.ts` | **Ny fil** - Cron-endepunkt |
| `prisma/schema.prisma` | Legg til `reminderSentAt` og `completionEmailSentAt` |
| `vercel.json` | **Ny fil** - Cron-konfigurasjon |
| `.env` | Oppdater `NEXT_PUBLIC_APP_URL`, legg til `EMAIL_FROM` og `CRON_SECRET` |

## Verifisering

1. **Domene:** Sjekk at Resend viser "Verified" for argonsolutions.no
2. **Velkomst-e-post:** Opprett ny ansatt i admin, bekreft e-post ankommer med riktig avsender og fungerende lenke
3. **Paminnelse-cron:** Kjor `curl /api/cron/reminders` manuelt, bekreft e-post sendes til ansatt med startdato om 3 uker
4. **Fullfort-e-post:** Fullfar alle 8 steg for en test-ansatt, bekreft gratulasjon-e-post sendes
5. **Duplikat-beskyttelse:** Kjor cron pa nytt, bekreft at ingen duplikat sendes
