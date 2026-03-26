import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

interface ParsedCertificate {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
}

function extractDates(text: string): string[] {
  const dates: { date: string; iso: string }[] = [];

  // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  const pattern1 = /(\d{2})[./\-](\d{2})[./\-](\d{4})/g;
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    const [, dd, mm, yyyy] = match;
    const iso = `${yyyy}-${mm}-${dd}`;
    if (isValidDate(iso)) dates.push({ date: match[0], iso });
  }

  // YYYY-MM-DD
  const pattern2 = /(\d{4})-(\d{2})-(\d{2})/g;
  while ((match = pattern2.exec(text)) !== null) {
    const iso = match[0];
    if (isValidDate(iso)) dates.push({ date: match[0], iso });
  }

  return dates.map((d) => d.iso);
}

function isValidDate(iso: string): boolean {
  const d = new Date(iso);
  return !isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2050;
}

function extractCourseName(text: string): string {
  // Try to find a meaningful course name from the text
  // Look for keywords near "kurs", "course", "sertifikat", "certificate"
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && l.length < 150);

  // Look for lines with course-related keywords
  const courseKeywords = /kurs|course|sertifik|certific|opplæring|training|kompetanse|competenc/i;
  for (const line of lines) {
    if (courseKeywords.test(line) && !/^(dato|date|gyldig|valid|utsted)/i.test(line)) {
      return line.slice(0, 100);
    }
  }

  // Fallback: use the first non-trivial line that isn't a date
  for (const line of lines) {
    if (!/^\d/.test(line) && line.length > 5) {
      return line.slice(0, 100);
    }
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const { base64 } = await request.json();
    if (!base64) {
      return NextResponse.json({ error: "Missing base64 PDF data" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const raw = base64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(raw, "base64");

    const pdf = await pdfParse(buffer);
    const text = pdf.text;

    const dates = extractDates(text);
    const courseName = extractCourseName(text);

    // Sort dates chronologically - first is likely "gyldig fra", second "gyldig til"
    dates.sort();

    const result: ParsedCertificate = {
      kursnavn: courseName,
      gyldigFra: dates[0] || "",
      gyldigTil: dates[1] || "",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json({ error: "Kunne ikke lese PDF-filen" }, { status: 500 });
  }
}
