import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  AlignmentType,
  LevelFormat,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalMergeType,
  Footer,
  Header,
  PageNumber,
  PageBreak,
} from "docx";

export interface CVCourse {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
}

export interface CVEducation {
  skole: string;
  fag: string;
  fraAar: string;
  tilAar: string;
}

export interface CVProject {
  fraDate: string;
  tilDate: string;
  tittel: string;
  rolle: string;
  beskrivelse: string;
}

export interface CVExperience {
  stilling: string;
  firma: string;
  fra: string;
  til: string;
  oppsummering: string;
  projects?: CVProject[];
}

export interface CVLanguage {
  spraak: string;
  nivaa: string;
}

export interface CVData {
  name: string;
  foedselsdato: string;
  stilling: string;
  yrke: string;
  nasjonalitet: string;
  sivilstatus: string;
  profilbilde?: string;
  profilbildeType?: string;
  sammendrag: string;
  kurs: CVCourse[];
  utdanning: CVEducation[];
  erfaring: CVExperience[];
  spraak: CVLanguage[];
  offshoreSertifikatGyldigTil?: string;
  forerkortkategorier?: string;
}

// OMT original exact colors and sizing
const HEADER_FILL = "8EAADB"; // Light blue from original
const FONT = "Helv";
const FONT_SIZE = 20; // 10pt in half-points
const COMPANY = "Offshore Marine Technology AS";

// Original table 0 column widths (DXA)
const COL_LABEL = 2371;
const COL_VALUE = 4995;
const COL_PHOTO = 1988;
const TABLE_WIDTH = COL_LABEL + COL_VALUE + COL_PHOTO; // 9354

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "auto",
};
const borders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

function run(text: string, bold?: boolean): TextRun {
  return new TextRun({ text, font: FONT, size: FONT_SIZE, bold: bold || undefined });
}

function labelCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" },
    borders,
    children: [new Paragraph({ children: [run(text)] })],
  });
}

function dataCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    children: [new Paragraph({ children: [run(text)] })],
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatDateFull(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function extractImageData(base64String: string): Buffer {
  const base64 = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

function loadLogo(): Buffer | null {
  try {
    const fs = require("fs");
    const path = require("path");
    const logoPath = path.join(process.cwd(), "public", "omt-logo.png");
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

export async function generateCVDocument(data: CVData): Promise<Buffer> {
  const logoBuffer = loadLogo();

  // === TABLE 0: Personal Info (8 rows x 3 cols) ===
  const personalRows: { label: string; value: string }[] = [
    { label: "Name", value: data.name || "" },
    { label: "Date of Birth", value: formatDateFull(data.foedselsdato) },
    { label: "Company", value: COMPANY },
    { label: "Languages", value: data.spraak?.map((s) => `${s.spraak}, `).join("").slice(0, -2) || "" },
    { label: "Nationality", value: data.nasjonalitet || "" },
    { label: "Position", value: data.stilling || "" },
    { label: "Profession", value: data.yrke || "" },
  ];

  // Build photo content
  let photoChildren: Paragraph[];
  if (data.profilbilde) {
    const imageBuffer = extractImageData(data.profilbilde);
    const imageType = (data.profilbildeType === "png" ? "png" : "jpg") as "png" | "jpg";
    photoChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: { width: 95, height: 130 },
            type: imageType,
          }),
        ],
      }),
    ];
  } else {
    photoChildren = [new Paragraph({ children: [] })];
  }

  // Rows 0-6: 3 columns (label, value, photo with vMerge)
  const infoTableRows: TableRow[] = personalRows.map((row, idx) => {
    const cells: TableCell[] = [
      labelCell(row.label, COL_LABEL),
      dataCell(row.value, COL_VALUE),
    ];

    if (idx === 0) {
      // First row: photo cell starts vMerge
      cells.push(
        new TableCell({
          width: { size: COL_PHOTO, type: WidthType.DXA },
          borders,
          verticalMerge: VerticalMergeType.RESTART,
          children: photoChildren,
        })
      );
    } else {
      // Subsequent rows: continue vMerge
      cells.push(
        new TableCell({
          width: { size: COL_PHOTO, type: WidthType.DXA },
          borders,
          verticalMerge: VerticalMergeType.CONTINUE,
          children: [new Paragraph({ children: [] })],
        })
      );
    }

    return new TableRow({ cantSplit: true, children: cells });
  });

  // Row 7 (Status): col 2+3 merged (gridSpan=2)
  infoTableRows.push(
    new TableRow({
      cantSplit: true,
      children: [
        labelCell("Status", COL_LABEL),
        new TableCell({
          width: { size: COL_VALUE + COL_PHOTO, type: WidthType.DXA },
          borders,
          columnSpan: 2,
          children: [new Paragraph({ children: [run(data.sivilstatus || "")] })],
        }),
      ],
    })
  );

  const personalInfoTable = new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_LABEL, COL_VALUE, COL_PHOTO],
    rows: infoTableRows,
  });

  // === TABLE 1: Summary (2 rows x 1 col) ===
  const summaryTable = new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [TABLE_WIDTH],
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" },
            borders,
            children: [new Paragraph({ children: [run("Summary")] })],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            borders,
            children: [new Paragraph({ children: [run(data.sammendrag || "")] })],
          }),
        ],
      }),
    ],
  });

  // === COURSES: Paragraph-based bullet list ===
  const coursesParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [run("SPECIFIC TECHNICAL EXPERTISE/SPECIALIST COURSES")],
    }),
  ];

  for (const k of (data.kurs || []).filter((k) => k.kursnavn)) {
    const hasValidity = k.gyldigFra || k.gyldigTil;
    coursesParagraphs.push(
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          run(k.kursnavn),
          ...(hasValidity
            ? [
                new TextRun({ break: 1, text: "", font: FONT, size: FONT_SIZE }),
                new TextRun({ text: `Valid: ${formatDate(k.gyldigFra)} \u2013 ${formatDate(k.gyldigTil)}`, font: FONT, size: FONT_SIZE }),
              ]
            : []),
        ],
      })
    );
  }

  // === TABLE 2: Education ===
  const eduCols = [TABLE_WIDTH / 4, TABLE_WIDTH / 4, TABLE_WIDTH / 4, TABLE_WIDTH / 4].map(Math.floor);
  // Adjust last col to match total
  eduCols[3] = TABLE_WIDTH - eduCols[0] - eduCols[1] - eduCols[2];

  const eduRows: TableRow[] = [
    // Header row: "Education" merged across 4 cols
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnSpan: 4,
          shading: { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" },
          borders,
          children: [new Paragraph({ children: [run("Education")] })],
        }),
      ],
    }),
    // Column headers
    new TableRow({
      cantSplit: true,
      children: [
        labelCell("School", eduCols[0]),
        labelCell("Subject", eduCols[1]),
        labelCell("From", eduCols[2]),
        labelCell("To", eduCols[3]),
      ],
    }),
  ];

  const filteredEdu = (data.utdanning || []).filter((u) => u.skole);
  for (const u of filteredEdu) {
    eduRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          dataCell(u.skole, eduCols[0]),
          dataCell(u.fag, eduCols[1]),
          dataCell(u.fraAar, eduCols[2]),
          dataCell(u.tilAar, eduCols[3]),
        ],
      })
    );
  }

  const educationTable = new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: eduCols,
    rows: eduRows,
  });

  // === EXPERIENCE TABLES ===
  // Original structure: each job is a block within a table
  // Experience header (merged) → blank row → Position/Company/From/To headers → data → Position summary
  const expCols = [2000, 2000, 3354, 1000, 1000];
  // Adjust to match TABLE_WIDTH
  expCols[2] = TABLE_WIDTH - expCols[0] - expCols[1] - expCols[3] - expCols[4];

  const experienceElements: (Paragraph | Table)[] = [];
  const filteredExp = (data.erfaring || []).filter((e) => e.stilling || e.firma);

  for (let ei = 0; ei < filteredExp.length; ei++) {
    const exp = filteredExp[ei];
    const expRows: TableRow[] = [];

    // "Experience" header row (merged across all cols)
    expRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            columnSpan: 5,
            shading: { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" },
            borders,
            children: [new Paragraph({ children: [run("Experience")] })],
          }),
        ],
      })
    );

    // Column headers: Position (merged 2 cols) | Company | From | To
    expRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: expCols[0] + expCols[1], type: WidthType.DXA },
            columnSpan: 2,
            shading: { type: ShadingType.CLEAR, fill: HEADER_FILL, color: "auto" },
            borders,
            children: [new Paragraph({ children: [run("Position")] })],
          }),
          labelCell("Company", expCols[2]),
          labelCell("From", expCols[3]),
          labelCell("To", expCols[4]),
        ],
      })
    );

    // Data row
    expRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: expCols[0] + expCols[1], type: WidthType.DXA },
            columnSpan: 2,
            borders,
            children: [new Paragraph({ children: [run(exp.stilling)] })],
          }),
          dataCell(exp.firma, expCols[2]),
          dataCell(exp.fra, expCols[3]),
          dataCell(exp.til || "DD", expCols[4]),
        ],
      })
    );

    // Position summary row (with projects below)
    if (exp.oppsummering || (exp.projects && exp.projects.length > 0)) {
      const summaryChildren: Paragraph[] = [];

      if (exp.oppsummering) {
        summaryChildren.push(new Paragraph({ spacing: { after: 80 }, children: [run(exp.oppsummering)] }));
      }

      // Projects section matching original OMT format:
      // "Projects:" header, then each project with bold date + title, italic role, description
      const filteredProjects = (exp.projects || []).filter((p) => p.tittel);
      if (filteredProjects.length > 0) {
        summaryChildren.push(
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({ text: "Projects:", bold: true, font: FONT, size: FONT_SIZE })],
          })
        );

        for (const proj of filteredProjects) {
          // Date line: "2025-06 - 2025-11"
          const dateLine = [proj.fraDate, proj.tilDate].filter(Boolean).join(" - ");
          if (dateLine) {
            summaryChildren.push(
              new Paragraph({
                spacing: { before: 60 },
                children: [new TextRun({ text: dateLine, bold: true, font: FONT, size: FONT_SIZE })],
              })
            );
          }

          // Title: bold
          summaryChildren.push(
            new Paragraph({
              children: [new TextRun({ text: proj.tittel, bold: true, font: FONT, size: FONT_SIZE })],
            })
          );

          // Role: italic
          if (proj.rolle) {
            summaryChildren.push(
              new Paragraph({
                children: [new TextRun({ text: proj.rolle, italics: true, font: FONT, size: FONT_SIZE })],
              })
            );
          }

          // Description (with spacing after for visual separation)
          if (proj.beskrivelse) {
            summaryChildren.push(
              new Paragraph({ spacing: { after: 100 }, children: [run(proj.beskrivelse)] })
            );
          }
        }
      }

      expRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            dataCell("Position summary", expCols[0]),
            new TableCell({
              width: { size: TABLE_WIDTH - expCols[0], type: WidthType.DXA },
              columnSpan: 4,
              borders,
              children: summaryChildren,
            }),
          ],
        })
      );
    }

    experienceElements.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: expCols,
        rows: expRows,
      })
    );

    // Small spacing between experience blocks
    if (ei < filteredExp.length - 1) {
      experienceElements.push(new Paragraph({ spacing: { before: 100 }, children: [] }));
    }
  }

  // === FOOTER INFO (paragraphs) ===
  const footerParagraphs: Paragraph[] = [];

  if (data.spraak?.length) {
    const langMap: Record<string, string> = {
      "Morsmål": "Native",
      "Flytende": "Professional working proficiency",
      "Profesjonelt": "Professional working proficiency",
      "Grunnleggende": "Elementary proficiency",
    };
    const langText = data.spraak
      .map((s) => `${langMap[s.nivaa] || s.nivaa} in ${s.spraak}`)
      .join(" and ");

    footerParagraphs.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [
          run("Language: "),
          run("\n" + langText + "."),
        ],
      })
    );
  }

  if (data.offshoreSertifikatGyldigTil) {
    footerParagraphs.push(
      new Paragraph({
        spacing: { before: 100 },
        children: [run("Offshore Certificate:")],
      }),
      new Paragraph({
        children: [run(`Valid until ${formatDate(data.offshoreSertifikatGyldigTil)}`)],
      })
    );
  }

  if (data.forerkortkategorier) {
    footerParagraphs.push(
      new Paragraph({
        spacing: { before: 100 },
        children: [run("Drivers Licence:")],
      }),
      new Paragraph({
        children: [run(`${data.forerkortkategorier} category`)],
      })
    );
  }

  // === BUILD DOCUMENT ===
  const doc = new Document({
    compatibility: {
      doNotBreakConstrainedForcedTable: true,
    },
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              ...(logoBuffer
                ? [new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 },
                    children: [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 100, height: 82 },
                        type: "png",
                      }),
                    ],
                  })]
                : []),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: FONT_SIZE }),
                ],
              }),
            ],
          }),
        },
        children: [
          // "Curriculum Vitae" title — light blue, centered (matches original)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Curriculum Vitae",
                font: FONT,
                size: 36, // 18pt
                color: HEADER_FILL,
              }),
            ],
          }),
          personalInfoTable,
          new Paragraph({ spacing: { before: 200 }, children: [] }),
          summaryTable,
          ...coursesParagraphs,
          new Paragraph({ spacing: { before: 200 }, children: [] }),
          educationTable,
          new Paragraph({ spacing: { before: 200 }, children: [] }),
          ...experienceElements,
          ...footerParagraphs,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
