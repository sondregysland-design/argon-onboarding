import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import type { CVData, CVExperience } from "@/lib/cv-template";

const BLUE = rgb(0.557, 0.667, 0.855); // #8EAADB
const WHITE = rgb(1, 1, 1);
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const COMPANY = "Offshore Marine Technology AS";

function fmtDate(d: string): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return d; }
}

function fmtMonthYear(d: string): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${m[date.getMonth()]} ${date.getFullYear()}`;
  } catch { return d; }
}

// Sanitize text: remove newlines and control chars that pdf-lib can't encode
function sanitize(text: string): string {
  return text.replace(/[\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
}

// Word-wrap text into lines that fit within maxWidth
function wrapText(text: string, fontSize: number, maxWidth: number, font: { widthOfTextAtSize: (t: string, s: number) => number }): string[] {
  const lines: string[] = [];
  // Split on newlines first, then word-wrap each paragraph
  const paragraphs = text.split(/\n/);
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) { lines.push(""); continue; }
    let line = "";
    for (const word of words) {
      const safe = word.replace(/[\n\r\t]/g, "");
      const test = line ? `${line} ${safe}` : safe;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
        if (line) lines.push(line);
        line = safe;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function GET(request: NextRequest) {
  try {
  const employeeId = request.nextUrl.searchParams.get("employeeId");
  if (!employeeId) return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });

  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, include: { steps: true } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const step3 = employee.steps.find((s) => s.stepNumber === 3);
  if (!step3?.data) return NextResponse.json({ error: "CV not completed" }, { status: 404 });

  const data: CVData = { ...JSON.parse(step3.data), name: employee.name };

  // Load logo
  let logoPngBytes: Uint8Array | undefined;
  try {
    const logoPath = path.join(process.cwd(), "public", "omt-logo.png");
    logoPngBytes = new Uint8Array(fs.readFileSync(logoPath));
  } catch { /* no logo */ }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const W = 595.28; // A4 width
  const H = 841.89; // A4 height
  const M = 40; // margin
  const CW = W - 2 * M; // content width

  let page = pdf.addPage([W, H]);
  let y = H - M;
  let pageNum = 1;

  function checkSpace(needed: number) {
    if (y - needed < M + 20) {
      // Add page number to current page
      page.drawText(String(pageNum), { x: W / 2 - 5, y: 20, size: 9, font, color: GRAY });
      pageNum++;
      page = pdf.addPage([W, H]);
      y = H - M;
      // Draw logo on new page
      if (logoPngBytes && logoImg) {
        page.drawImage(logoImg, { x: W - M - 60, y: y - 50, width: 60, height: 50 });
        y -= 60;
      }
    }
  }

  // Embed logo
  let logoImg: Awaited<ReturnType<typeof pdf.embedPng>> | undefined;
  if (logoPngBytes) {
    try { logoImg = await pdf.embedPng(logoPngBytes); } catch { /* skip */ }
  }

  // Embed profile photo
  let profileImg: Awaited<ReturnType<typeof pdf.embedJpg>> | Awaited<ReturnType<typeof pdf.embedPng>> | undefined;
  if (data.profilbilde) {
    try {
      const b64 = data.profilbilde.replace(/^data:image\/\w+;base64,/, "");
      const imgBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      if (data.profilbildeType === "png" || data.profilbilde.includes("image/png")) {
        profileImg = await pdf.embedPng(imgBytes);
      } else {
        profileImg = await pdf.embedJpg(imgBytes);
      }
    } catch { /* skip */ }
  }

  // === LOGO ===
  if (logoImg) {
    page.drawImage(logoImg, { x: W - M - 60, y: y - 50, width: 60, height: 50 });
    y -= 55;
  }

  // === TITLE ===
  const titleText = "Curriculum Vitae";
  const tw = fontItalic.widthOfTextAtSize(titleText, 16);
  page.drawText(titleText, { x: (W - tw) / 2, y, size: 16, font: fontItalic, color: BLUE });
  y -= 25;

  // === PERSONAL INFO TABLE ===
  const infoRows = [
    ["Name", data.name || ""],
    ["Date of Birth", fmtDate(data.foedselsdato)],
    ["Company", COMPANY],
    ["Languages", (data.spraak || []).map((s) => s.spraak).join(", ") || "Norsk, Engelsk"],
    ["Nationality", data.nasjonalitet || "Norsk"],
    ["Position", data.stilling || ""],
    ["Profession", data.yrke || ""],
    ["Status", data.sivilstatus || ""],
  ];

  const labelW = 100;
  const valueW = profileImg ? CW - labelW - 90 : CW - labelW;
  const rowH = 16;

  // Profile image (right side, spanning multiple rows)
  if (profileImg) {
    const imgH = Math.min(100, rowH * infoRows.length);
    const imgW = imgH * 0.8;
    page.drawImage(profileImg, { x: M + labelW + valueW + 5, y: y - imgH + rowH, width: imgW, height: imgH });
  }

  for (const [label, value] of infoRows) {
    // Blue label cell
    page.drawRectangle({ x: M, y: y - rowH + 2, width: labelW, height: rowH, color: BLUE });
    page.drawText(label, { x: M + 4, y: y - rowH + 6, size: 9, font: fontBold, color: WHITE });
    // Value cell border
    page.drawRectangle({ x: M + labelW, y: y - rowH + 2, width: valueW, height: rowH, borderColor: GRAY, borderWidth: 0.5 });
    page.drawText(sanitize(value), { x: M + labelW + 4, y: y - rowH + 6, size: 9, font });
    y -= rowH;
  }

  y -= 12;

  // === SUMMARY ===
  if (data.sammendrag) {
    checkSpace(40);
    page.drawRectangle({ x: M, y: y - 14, width: CW, height: 16, color: BLUE });
    page.drawText("Summary", { x: M + 4, y: y - 10, size: 10, font: fontBold, color: WHITE });
    y -= 18;

    // Word-wrap summary
    const summLines = wrapText(data.sammendrag, 9, CW - 10, font);
    for (const sl of summLines) {
      checkSpace(12);
      page.drawText(sl, { x: M + 4, y: y, size: 9, font });
      y -= 12;
    }
    y -= 6;
  }

  // === COURSES ===
  const filteredKurs = (data.kurs || []).filter((k) => k.kursnavn);
  if (filteredKurs.length > 0) {
    checkSpace(30);
    page.drawText("SPECIFIC TECHNICAL EXPERTISE/SPECIALIST COURSES", { x: M, y, size: 9, font: fontBold });
    y -= 14;

    for (const k of filteredKurs) {
      checkSpace(24);
      page.drawText(`\u2022  ${sanitize(k.kursnavn)}`, { x: M + 15, y, size: 9, font });
      y -= 12;
      if (k.gyldigFra || k.gyldigTil) {
        page.drawText(`Valid: ${fmtMonthYear(k.gyldigFra)} \u2013 ${fmtMonthYear(k.gyldigTil)}`, { x: M + 25, y, size: 8, font });
        y -= 12;
      }
    }
    y -= 6;
  }

  // === EDUCATION ===
  const filteredEdu = (data.utdanning || []).filter((u) => u.skole);
  if (filteredEdu.length > 0) {
    checkSpace(50);
    // Section header
    page.drawRectangle({ x: M, y: y - 14, width: CW, height: 16, color: BLUE });
    page.drawText("Education", { x: M + 4, y: y - 10, size: 10, font: fontBold, color: WHITE });
    y -= 18;

    // Column headers
    const cols = [{ w: CW * 0.3, t: "School" }, { w: CW * 0.35, t: "Subject" }, { w: CW * 0.175, t: "From" }, { w: CW * 0.175, t: "To" }];
    let cx = M;
    for (const col of cols) {
      page.drawRectangle({ x: cx, y: y - 14, width: col.w, height: 16, color: BLUE });
      page.drawText(col.t, { x: cx + 4, y: y - 10, size: 9, font: fontBold, color: WHITE });
      cx += col.w;
    }
    y -= 18;

    for (const u of filteredEdu) {
      checkSpace(18);
      cx = M;
      const vals = [u.skole, u.fag, u.fraAar, u.tilAar];
      for (let i = 0; i < cols.length; i++) {
        page.drawRectangle({ x: cx, y: y - 14, width: cols[i].w, height: 16, borderColor: GRAY, borderWidth: 0.5 });
        page.drawText(sanitize(vals[i] || ""), { x: cx + 4, y: y - 10, size: 9, font });
        cx += cols[i].w;
      }
      y -= 18;
    }
    y -= 8;
  }

  // === EXPERIENCE ===
  const filteredExp = (data.erfaring || []).filter((e: CVExperience) => e.stilling || e.firma);
  for (const exp of filteredExp) {
    checkSpace(70);

    // Experience header
    page.drawRectangle({ x: M, y: y - 14, width: CW, height: 16, color: BLUE });
    page.drawText("Experience", { x: M + 4, y: y - 10, size: 10, font: fontBold, color: WHITE });
    y -= 18;

    // Column headers
    const expCols = [{ w: CW * 0.25, t: "Position" }, { w: CW * 0.4, t: "Company" }, { w: CW * 0.175, t: "From" }, { w: CW * 0.175, t: "To" }];
    let cx = M;
    for (const col of expCols) {
      page.drawRectangle({ x: cx, y: y - 14, width: col.w, height: 16, color: BLUE });
      page.drawText(col.t, { x: cx + 4, y: y - 10, size: 9, font: fontBold, color: WHITE });
      cx += col.w;
    }
    y -= 18;

    // Data row
    cx = M;
    const vals = [exp.stilling, exp.firma, exp.fra, exp.til || "DD"];
    for (let i = 0; i < expCols.length; i++) {
      page.drawRectangle({ x: cx, y: y - 14, width: expCols[i].w, height: 16, borderColor: GRAY, borderWidth: 0.5 });
      page.drawText(sanitize(vals[i] || ""), { x: cx + 4, y: y - 10, size: 9, font });
      cx += expCols[i].w;
    }
    y -= 18;

    // Position summary
    if (exp.oppsummering || (exp.projects && exp.projects.length > 0)) {
      const summaryLabelW = CW * 0.2;
      const summaryValW = CW * 0.8;

      // Word-wrap the summary text to estimate height
      const summaryLines: string[] = exp.oppsummering ? wrapText(exp.oppsummering, 8, summaryValW - 10, font) : [];

      // Projects text
      const projectLines: { text: string; bold: boolean; italic: boolean }[] = [];
      if (exp.projects && exp.projects.length > 0) {
        projectLines.push({ text: "", bold: false, italic: false }); // spacer
        projectLines.push({ text: "Projects:", bold: true, italic: false });
        for (const p of exp.projects.filter((p) => p.tittel)) {
          if (p.fraDate || p.tilDate) projectLines.push({ text: sanitize(`${p.fraDate} - ${p.tilDate}`), bold: true, italic: false });
          projectLines.push({ text: sanitize(p.tittel), bold: true, italic: false });
          if (p.rolle) projectLines.push({ text: sanitize(p.rolle), bold: false, italic: true });
          if (p.beskrivelse) {
            const descLines = wrapText(p.beskrivelse, 8, summaryValW - 15, font);
            for (const dl of descLines) {
              projectLines.push({ text: dl, bold: false, italic: false });
            }
          }
          projectLines.push({ text: "", bold: false, italic: false }); // spacer
        }
      }

      const totalLines = summaryLines.length + projectLines.length;
      const cellH = Math.max(16, totalLines * 11 + 8);

      checkSpace(cellH);

      // Label cell
      page.drawRectangle({ x: M, y: y - cellH, width: summaryLabelW, height: cellH, borderColor: GRAY, borderWidth: 0.5 });
      page.drawText("Position summary", { x: M + 3, y: y - 11, size: 8, font: fontBold });

      // Value cell
      page.drawRectangle({ x: M + summaryLabelW, y: y - cellH, width: summaryValW, height: cellH, borderColor: GRAY, borderWidth: 0.5 });

      let ty = y - 11;
      for (const line of summaryLines) {
        page.drawText(line, { x: M + summaryLabelW + 4, y: ty, size: 8, font });
        ty -= 11;
      }
      for (const pl of projectLines) {
        if (!pl.text) { ty -= 4; continue; }
        const f = pl.bold ? fontBold : pl.italic ? fontItalic : font;
        page.drawText(pl.text, { x: M + summaryLabelW + 4, y: ty, size: 8, font: f });
        ty -= 11;
      }

      y -= cellH;
    }
    y -= 8;
  }

  // === PAGE NUMBER on last page ===
  page.drawText(String(pageNum), { x: W / 2 - 5, y: 20, size: 9, font, color: GRAY });

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CV - ${data.name}.pdf"`,
    },
  });
  } catch (err: unknown) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed", details: String(err) }, { status: 500 });
  }
}
