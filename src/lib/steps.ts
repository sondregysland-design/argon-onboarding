export const STEP_COUNT = 8;

export const STEPS = [
  { number: 1, name: "Personopplysninger", description: "Fyll ut personlig informasjon" },
  { number: 2, name: "Verneutstyr", description: "Bestill sko, kjeledress og t-skjorter" },
  { number: 3, name: "CV-utarbeidelse", description: "Sett opp CV etter bedriftsstandard" },
  { number: 4, name: "Teknisk gjennomgang", description: "Gjennomgå tekniske løsninger og avvik" },
  { number: 5, name: "Elektro-quiz", description: "Fullfør den interaktive quizen" },
  { number: 6, name: "Tripletex", description: "Lær timeføring, ferie og avviksregistrering" },
  { number: 7, name: "Generell informasjon", description: "Kontaktinfo, forsikring og velferd" },
  { number: 8, name: "Videobibliotek", description: "Se opplæringsvideoer" },
] as const;

export type StepStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
