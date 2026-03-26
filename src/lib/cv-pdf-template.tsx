import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { CVData } from "./cv-template";

const HEADER_FILL = "#1E40AF";
const COMPANY = "Argon Solutions AS";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 66,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    color: HEADER_FILL,
    marginBottom: 12,
  },
  // Tables
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    backgroundColor: HEADER_FILL,
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 10,
  },
  dataCell: {
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 10,
  },
  // Section headers
  sectionHeader: {
    backgroundColor: HEADER_FILL,
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 10,
  },
  // Bullet items
  bulletRow: {
    flexDirection: "row",
    marginLeft: 20,
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
  },
  spacer: {
    height: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#333",
  },
});

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

export function CVPdfDocument({ data, logoBase64 }: { data: CVData; logoBase64?: string }) {
  const langMap: Record<string, string> = {
    "Morsmål": "Native",
    "Flytende": "Professional working proficiency",
    "Profesjonelt": "Professional working proficiency",
    "Grunnleggende": "Elementary proficiency",
  };

  const personalRows = [
    { label: "Name", value: data.name || "" },
    { label: "Date of Birth", value: formatDateFull(data.foedselsdato) },
    { label: "Company", value: COMPANY },
    { label: "Languages", value: data.spraak?.map((s) => s.spraak).join(", ") || "" },
    { label: "Nationality", value: data.nasjonalitet || "" },
    { label: "Position", value: data.stilling || "" },
    { label: "Profession", value: data.yrke || "" },
  ];

  const filteredKurs = (data.kurs || []).filter((k) => k.kursnavn);
  const filteredEdu = (data.utdanning || []).filter((u) => u.skole);
  const filteredExp = (data.erfaring || []).filter((e) => e.stilling || e.firma);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Logo */}
        {logoBase64 && (
          <View style={s.logoContainer}>
            <Image src={logoBase64} style={s.logo} />
          </View>
        )}

        {/* Title */}
        <Text style={s.title}>Curriculum Vitae</Text>

        {/* Personal Info Table */}
        <View style={s.table}>
          {personalRows.map((row, i) => (
            <View style={s.row} key={i}>
              <View style={[s.headerCell, { width: "25%" }]}>
                <Text>{row.label}</Text>
              </View>
              <View style={[s.dataCell, { width: data.profilbilde && i === 0 ? "53%" : i === 0 ? "75%" : data.profilbilde ? "53%" : "75%" }]}>
                <Text>{row.value}</Text>
              </View>
              {data.profilbilde && i === 0 && (
                <View style={[s.dataCell, { width: "22%", alignItems: "center", justifyContent: "center" }]}>
                  <Image src={data.profilbilde} style={{ width: 70, height: 95 }} />
                </View>
              )}
            </View>
          ))}
          {/* Status row */}
          <View style={s.row}>
            <View style={[s.headerCell, { width: "25%" }]}>
              <Text>Status</Text>
            </View>
            <View style={[s.dataCell, { width: "75%" }]}>
              <Text>{data.sivilstatus || ""}</Text>
            </View>
          </View>
        </View>

        <View style={s.spacer} />

        {/* Summary */}
        <View style={s.table}>
          <View style={s.row}>
            <View style={[s.sectionHeader, { width: "100%" }]}>
              <Text>Summary</Text>
            </View>
          </View>
          <View style={s.row}>
            <View style={[s.dataCell, { width: "100%" }]}>
              <Text>{data.sammendrag || ""}</Text>
            </View>
          </View>
        </View>

        {/* Courses */}
        {filteredKurs.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={s.bold}>SPECIFIC TECHNICAL EXPERTISE/SPECIALIST COURSES</Text>
            {filteredKurs.map((k, i) => (
              <View style={s.bulletRow} key={i}>
                <Text style={s.bullet}>{"\u2022"}</Text>
                <View style={s.bulletText}>
                  <Text>{k.kursnavn}</Text>
                  {(k.gyldigFra || k.gyldigTil) && (
                    <Text>Valid: {formatDate(k.gyldigFra)} {"\u2013"} {formatDate(k.gyldigTil)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.spacer} />

        {/* Education Table */}
        {filteredEdu.length > 0 && (
          <View style={s.table}>
            <View style={s.row}>
              <View style={[s.sectionHeader, { width: "100%" }]}>
                <Text>Education</Text>
              </View>
            </View>
            <View style={s.row}>
              <View style={[s.headerCell, { width: "30%" }]}><Text>School</Text></View>
              <View style={[s.headerCell, { width: "40%" }]}><Text>Subject</Text></View>
              <View style={[s.headerCell, { width: "15%" }]}><Text>From</Text></View>
              <View style={[s.headerCell, { width: "15%" }]}><Text>To</Text></View>
            </View>
            {filteredEdu.map((u, i) => (
              <View style={s.row} key={i}>
                <View style={[s.dataCell, { width: "30%" }]}><Text>{u.skole}</Text></View>
                <View style={[s.dataCell, { width: "40%" }]}><Text>{u.fag}</Text></View>
                <View style={[s.dataCell, { width: "15%" }]}><Text>{u.fraAar}</Text></View>
                <View style={[s.dataCell, { width: "15%" }]}><Text>{u.tilAar}</Text></View>
              </View>
            ))}
          </View>
        )}

        <View style={s.spacer} />

        {/* Experience */}
        {filteredExp.map((exp, ei) => (
          <View key={ei} style={{ marginBottom: 8 }} wrap={false}>
            <View style={s.table}>
              {/* Experience header */}
              <View style={s.row}>
                <View style={[s.sectionHeader, { width: "100%" }]}>
                  <Text>Experience</Text>
                </View>
              </View>
              {/* Column headers */}
              <View style={s.row}>
                <View style={[s.headerCell, { width: "30%" }]}><Text>Position</Text></View>
                <View style={[s.headerCell, { width: "40%" }]}><Text>Company</Text></View>
                <View style={[s.headerCell, { width: "15%" }]}><Text>From</Text></View>
                <View style={[s.headerCell, { width: "15%" }]}><Text>To</Text></View>
              </View>
              {/* Data row */}
              <View style={s.row}>
                <View style={[s.dataCell, { width: "30%" }]}><Text>{exp.stilling}</Text></View>
                <View style={[s.dataCell, { width: "40%" }]}><Text>{exp.firma}</Text></View>
                <View style={[s.dataCell, { width: "15%" }]}><Text>{exp.fra}</Text></View>
                <View style={[s.dataCell, { width: "15%" }]}><Text>{exp.til || "DD"}</Text></View>
              </View>
              {/* Position summary */}
              {(exp.oppsummering || (exp.projects && exp.projects.length > 0)) && (
                <View style={s.row}>
                  <View style={[s.dataCell, { width: "20%" }]}><Text>Position summary</Text></View>
                  <View style={[s.dataCell, { width: "80%" }]}>
                    {exp.oppsummering && <Text style={{ marginBottom: 4 }}>{exp.oppsummering}</Text>}
                    {exp.projects && exp.projects.filter((p) => p.tittel).length > 0 && (
                      <View>
                        <Text style={[s.bold, { marginTop: 4 }]}>Projects:</Text>
                        {exp.projects.filter((p) => p.tittel).map((proj, pi) => (
                          <View key={pi} style={{ marginTop: 4, marginBottom: 4 }}>
                            {(proj.fraDate || proj.tilDate) && (
                              <Text style={s.bold}>{[proj.fraDate, proj.tilDate].filter(Boolean).join(" - ")}</Text>
                            )}
                            <Text style={s.bold}>{proj.tittel}</Text>
                            {proj.rolle && <Text style={s.italic}>{proj.rolle}</Text>}
                            {proj.beskrivelse && <Text>{proj.beskrivelse}</Text>}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Footer info */}
        {data.spraak?.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text>Language:</Text>
            <Text>
              {data.spraak.map((sp) => `${langMap[sp.nivaa] || sp.nivaa} in ${sp.spraak}`).join(" and ")}.
            </Text>
          </View>
        )}

        {data.offshoreSertifikatGyldigTil && (
          <View style={{ marginTop: 6 }}>
            <Text>Offshore Certificate:</Text>
            <Text>Valid until {formatDate(data.offshoreSertifikatGyldigTil)}</Text>
          </View>
        )}

        {data.forerkortkategorier && (
          <View style={{ marginTop: 6 }}>
            <Text>Drivers Licence:</Text>
            <Text>{data.forerkortkategorier} category</Text>
          </View>
        )}

        {/* Page number */}
        <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
