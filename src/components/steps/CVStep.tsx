"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

interface Course {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
  pdfBase64?: string;
  pdfName?: string;
}

interface Education {
  skole: string;
  fag: string;
  fraAar: string;
  tilAar: string;
}

interface Project {
  fraDate: string;
  tilDate: string;
  tittel: string;
  rolle: string;
  beskrivelse: string;
}

interface Experience {
  stilling: string;
  firma: string;
  fra: string;
  til: string;
  oppsummering: string;
  projects: Project[];
}

interface Language {
  spraak: string;
  nivaa: string;
}

interface Attachment {
  name: string;
  type: string;
  size: number;
  base64: string;
}

interface CVForm {
  foedselsdato: string;
  stilling: string;
  yrke: string;
  nasjonalitet: string;
  sivilstatus: string;
  profilbilde: string;
  profilbildeType: string;
  sammendrag: string;
  kurs: Course[];
  utdanning: Education[];
  erfaring: Experience[];
  spraak: Language[];
  offshoreSertifikatGyldigTil: string;
  forerkortkategorier: string;
  attachments: Attachment[];
}

function initForm(data: Record<string, unknown> | null): CVForm {
  if (data) {
    return {
      foedselsdato: (data.foedselsdato as string) || "",
      stilling: (data.stilling as string) || "",
      yrke: (data.yrke as string) || "",
      nasjonalitet: (data.nasjonalitet as string) || "Norsk",
      sivilstatus: (data.sivilstatus as string) || "Ugift",
      profilbilde: (data.profilbilde as string) || "",
      profilbildeType: (data.profilbildeType as string) || "",
      sammendrag: (data.sammendrag as string) || "",
      kurs: (data.kurs as Course[]) || [{ kursnavn: "", gyldigFra: "", gyldigTil: "" }],
      utdanning: (data.utdanning as Education[]) || [{ skole: "", fag: "", fraAar: "", tilAar: "" }],
      erfaring: ((data.erfaring as Experience[]) || [{ stilling: "", firma: "", fra: "", til: "", oppsummering: "", projects: [] }]).map(e => ({ ...e, projects: e.projects || [] })),
      spraak: (data.spraak as Language[]) || [{ spraak: "Norsk", nivaa: "Morsmål" }],
      offshoreSertifikatGyldigTil: (data.offshoreSertifikatGyldigTil as string) || "",
      forerkortkategorier: (data.forerkortkategorier as string) || "",
      attachments: (data.attachments as Attachment[]) || [],
    };
  }
  return {
    foedselsdato: "",
    stilling: "",
    yrke: "",
    nasjonalitet: "Norsk",
    sivilstatus: "Ugift",
    profilbilde: "",
    profilbildeType: "",
    sammendrag: "",
    kurs: [{ kursnavn: "", gyldigFra: "", gyldigTil: "" }],
    utdanning: [{ skole: "", fag: "", fraAar: "", tilAar: "" }],
    erfaring: [{ stilling: "", firma: "", fra: "", til: "", oppsummering: "", projects: [] }],
    spraak: [{ spraak: "Norsk", nivaa: "Morsmål" }],
    offshoreSertifikatGyldigTil: "",
    forerkortkategorier: "",
    attachments: [],
  };
}

export function CVStep({ onComplete, data }: Props) {
  const [form, setForm] = useState<CVForm>(() => initForm(data));
  const [imagePreview, setImagePreview] = useState<string | null>(
    data?.profilbilde ? (data.profilbilde as string) : null
  );
  const [imageError, setImageError] = useState("");
  const [pdfUploading, setPdfUploading] = useState<number | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certUploadRef = useRef<HTMLInputElement>(null);
  const pdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function update<K extends keyof CVForm>(key: K, value: CVForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateListItem<T>(key: keyof CVForm, index: number, field: keyof T, value: string) {
    setForm((prev) => {
      const list = [...(prev[key] as T[])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [key]: list };
    });
  }

  function addListItem<T>(key: keyof CVForm, template: T) {
    setForm((prev) => ({
      ...prev,
      [key]: [...(prev[key] as T[]), template],
    }));
  }

  function removeListItem(key: keyof CVForm, index: number) {
    setForm((prev) => {
      const list = [...(prev[key] as unknown[])];
      if (list.length <= 1) return prev;
      list.splice(index, 1);
      return { ...prev, [key]: list };
    });
  }

  async function handleCertificateUpload(file: File) {
    if (file.type !== "application/pdf") {
      alert("Kun PDF-filer er tillatt.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Maks filstørrelse er 5MB.");
      return;
    }

    setCertUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/parse-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64 }),
      });

      const parsed = res.ok ? await res.json() : {};

      setForm((prev) => {
        const newCourse: Course = {
          kursnavn: parsed.kursnavn || "",
          gyldigFra: parsed.gyldigFra || "",
          gyldigTil: parsed.gyldigTil || "",
          pdfBase64: base64,
          pdfName: file.name,
        };
        // Replace the first empty course, or append
        const firstEmpty = prev.kurs.findIndex(
          (k) => !k.kursnavn && !k.gyldigFra && !k.gyldigTil && !k.pdfBase64
        );
        if (firstEmpty >= 0) {
          const kurs = [...prev.kurs];
          kurs[firstEmpty] = newCourse;
          return { ...prev, kurs };
        }
        return { ...prev, kurs: [...prev.kurs, newCourse] };
      });
    } catch {
      alert("Kunne ikke lese PDF-filen. Prøv igjen.");
    } finally {
      setCertUploading(false);
    }
  }

  async function handlePdfUpload(file: File, courseIndex: number) {
    if (file.type !== "application/pdf") {
      alert("Kun PDF-filer er tillatt.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Maks filstørrelse er 5MB.");
      return;
    }

    setPdfUploading(courseIndex);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Parse PDF to extract course info
      const res = await fetch("/api/parse-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64 }),
      });

      if (res.ok) {
        const parsed = await res.json();
        setForm((prev) => {
          const kurs = [...prev.kurs];
          kurs[courseIndex] = {
            ...kurs[courseIndex],
            kursnavn: parsed.kursnavn || kurs[courseIndex].kursnavn,
            gyldigFra: parsed.gyldigFra || kurs[courseIndex].gyldigFra,
            gyldigTil: parsed.gyldigTil || kurs[courseIndex].gyldigTil,
            pdfBase64: base64,
            pdfName: file.name,
          };
          return { ...prev, kurs };
        });
      } else {
        // Still store the PDF even if parsing fails
        setForm((prev) => {
          const kurs = [...prev.kurs];
          kurs[courseIndex] = {
            ...kurs[courseIndex],
            pdfBase64: base64,
            pdfName: file.name,
          };
          return { ...prev, kurs };
        });
      }
    } catch {
      alert("Kunne ikke lese PDF-filen. Prøv igjen.");
    } finally {
      setPdfUploading(null);
    }
  }

  function downloadPdf(kurs: Course) {
    if (!kurs.pdfBase64) return;
    const link = document.createElement("a");
    link.href = kurs.pdfBase64;
    link.download = kurs.pdfName || "sertifikat.pdf";
    link.click();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setImageError("Kun JPG og PNG er tillatt.");
      return;
    }
    if (file.size > 500 * 1024) {
      setImageError("Maks filstørrelse er 500KB.");
      return;
    }

    const imageType = file.type === "image/png" ? "png" : "jpg";
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      update("profilbilde", base64);
      update("profilbildeType", imageType);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(form as unknown as Record<string, unknown>);
  }

  const sectionClass = "space-y-3 border border-gray-200 rounded-lg p-4";
  const sectionTitle = "text-base font-semibold text-navy-900 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Fyll ut CV-en etter OMT sin standard. Alle felt merket med * er obligatoriske.
      </div>

      {/* Personinfo */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Personinfo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Fødselsdato"
            type="date"
            value={form.foedselsdato}
            onChange={(e) => update("foedselsdato", e.target.value)}
            required
          />
          <Input
            label="Stilling"
            placeholder="f.eks. Electrical Supervisor"
            value={form.stilling}
            onChange={(e) => update("stilling", e.target.value)}
            required
          />
          <Input
            label="Yrke"
            placeholder="f.eks. Electrician"
            value={form.yrke}
            onChange={(e) => update("yrke", e.target.value)}
            required
          />
          <Input
            label="Nasjonalitet"
            value={form.nasjonalitet}
            onChange={(e) => update("nasjonalitet", e.target.value)}
            required
          />
          <div className="space-y-1">
            <label htmlFor="sivilstatus" className="block text-sm font-medium text-gray-700">
              Sivilstatus <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              id="sivilstatus"
              value={form.sivilstatus}
              onChange={(e) => update("sivilstatus", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            >
              <option value="Ugift">Ugift</option>
              <option value="Gift">Gift</option>
              <option value="Samboer">Samboer</option>
              <option value="Skilt">Skilt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profilbilde */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Profilbilde</h3>
        <p className="text-sm text-gray-500 mb-2">Last opp et profesjonelt bilde (JPG/PNG, maks 500KB).</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navy-100 file:text-navy-900 hover:file:bg-navy-200"
        />
        {imageError && <p className="text-sm text-red-600">{imageError}</p>}
        {imagePreview && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Profilbilde forhåndsvisning"
              className="w-24 h-32 object-cover rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Sammendrag */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Sammendrag</h3>
        <div className="space-y-1">
          <label htmlFor="sammendrag" className="block text-sm font-medium text-gray-700">
            Kort beskrivelse av kompetanse og erfaring <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            id="sammendrag"
            value={form.sammendrag}
            onChange={(e) => update("sammendrag", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            rows={4}
            required
            placeholder="3-5 setninger om din kompetanse og erfaring..."
          />
        </div>
      </div>

      {/* Vedlegg / Sertifikater */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Vedlegg / Sertifikater</h3>
        <p className="text-sm text-gray-500 mb-2">Last opp relevante dokumenter (PDF, bilder, Word). Maks 2MB per fil, maks 5 filer.</p>

        {form.attachments.length > 0 && (
          <div className="space-y-1 mb-3">
            {form.attachments.map((att, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 text-xs uppercase">{att.type.split("/")[1]?.slice(0, 4) || "fil"}</span>
                  <span className="truncate font-medium">{att.name}</span>
                  <span className="text-gray-400 text-xs">({(att.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, attachments: form.attachments.filter((_, idx) => idx !== i) });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
        )}

        {form.attachments.length < 5 && (
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 2 * 1024 * 1024) {
                alert("Filen er for stor. Maks 2MB.");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result as string;
                setForm({
                  ...form,
                  attachments: [...form.attachments, { name: file.name, type: file.type, size: file.size, base64 }],
                });
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
            className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navy-100 file:text-navy-700 hover:file:bg-navy-200"
          />
        )}
      </div>

      {/* Last opp sertifikat-PDF */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Last opp sertifikat-PDF</h3>
        <p className="text-sm text-gray-500 mb-2">
          Last opp en PDF av sertifikatet — kursnavn og datoer fylles ut automatisk.
        </p>
        <input
          type="file"
          accept=".pdf"
          ref={certUploadRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCertificateUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => certUploadRef.current?.click()}
          disabled={certUploading}
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {certUploading ? "Leser PDF..." : "📎 Last opp sertifikat (PDF)"}
        </button>
      </div>

      {/* Spesialkurs/sertifikater */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Spesialkurs / Sertifikater</h3>
        {form.kurs.map((kurs, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
            <div>
              <Input
                label={`Kursnavn ${i + 1}`}
                value={kurs.kursnavn}
                onChange={(e) => updateListItem<Course>("kurs", i, "kursnavn", e.target.value)}
                placeholder="f.eks. G20 Trucksertifikat"
              />
              {kurs.pdfBase64 && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={(el) => { pdfInputRefs.current[i] = el; }}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file, i);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => downloadPdf(kurs)}
                    className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded px-2 py-0.5"
                    title={kurs.pdfName || "Last ned PDF"}
                  >
                    📄 <span className="truncate max-w-[150px]">{kurs.pdfName || "Sertifikat.pdf"}</span> ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => pdfInputRefs.current[i]?.click()}
                    disabled={pdfUploading === i}
                    className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                  >
                    Bytt
                  </button>
                </div>
              )}
            </div>
            <Input
              label="Gyldig fra"
              type="date"
              value={kurs.gyldigFra}
              onChange={(e) => updateListItem<Course>("kurs", i, "gyldigFra", e.target.value)}
            />
            <Input
              label="Gyldig til"
              type="date"
              value={kurs.gyldigTil}
              onChange={(e) => updateListItem<Course>("kurs", i, "gyldigTil", e.target.value)}
            />
            {form.kurs.length > 1 && (
              <button
                type="button"
                onClick={() => removeListItem("kurs", i)}
                className="text-red-500 hover:text-red-700 text-sm pb-1"
              >
                Fjern
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addListItem<Course>("kurs", { kursnavn: "", gyldigFra: "", gyldigTil: "" })}
          className="text-sm text-navy-900 hover:underline font-medium"
        >
          + Legg til kurs
        </button>
      </div>

      {/* Utdanning */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Utdanning</h3>
        {form.utdanning.map((utd, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-end">
            <Input
              label={`Skole ${i + 1}`}
              value={utd.skole}
              onChange={(e) => updateListItem<Education>("utdanning", i, "skole", e.target.value)}
              placeholder="f.eks. OTG Stavanger"
            />
            <Input
              label="Fag"
              value={utd.fag}
              onChange={(e) => updateListItem<Education>("utdanning", i, "fag", e.target.value)}
              placeholder="f.eks. Elektro"
            />
            <Input
              label="Fra"
              value={utd.fraAar}
              onChange={(e) => updateListItem<Education>("utdanning", i, "fraAar", e.target.value)}
              placeholder="2015"
            />
            <Input
              label="Til"
              value={utd.tilAar}
              onChange={(e) => updateListItem<Education>("utdanning", i, "tilAar", e.target.value)}
              placeholder="2018"
            />
            {form.utdanning.length > 1 && (
              <button
                type="button"
                onClick={() => removeListItem("utdanning", i)}
                className="text-red-500 hover:text-red-700 text-sm pb-1"
              >
                Fjern
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addListItem<Education>("utdanning", { skole: "", fag: "", fraAar: "", tilAar: "" })}
          className="text-sm text-navy-900 hover:underline font-medium"
        >
          + Legg til utdanning
        </button>
      </div>

      {/* Erfaring */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Erfaring</h3>
        {form.erfaring.map((erf, i) => (
          <div key={i} className="space-y-2 border-b border-gray-100 pb-3 last:border-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                label={`Stilling ${i + 1}`}
                value={erf.stilling}
                onChange={(e) => updateListItem<Experience>("erfaring", i, "stilling", e.target.value)}
                placeholder="f.eks. Elektriker"
              />
              <Input
                label="Firma"
                value={erf.firma}
                onChange={(e) => updateListItem<Experience>("erfaring", i, "firma", e.target.value)}
                placeholder="f.eks. Aker Solutions"
              />
              <Input
                label="Fra"
                value={erf.fra}
                onChange={(e) => updateListItem<Experience>("erfaring", i, "fra", e.target.value)}
                placeholder="2018"
              />
              <Input
                label="Til"
                value={erf.til}
                onChange={(e) => updateListItem<Experience>("erfaring", i, "til", e.target.value)}
                placeholder="2022"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`oppsummering-${i}`} className="block text-sm font-medium text-gray-700">
                Oppsummering
              </label>
              <textarea
                id={`oppsummering-${i}`}
                value={erf.oppsummering}
                onChange={(e) => updateListItem<Experience>("erfaring", i, "oppsummering", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                rows={2}
                placeholder="Beskriv arbeidsoppgaver og ansvar..."
              />
            </div>
            {/* Projects under this experience */}
            <div className="mt-3 ml-2 border-l-2 border-navy-200 pl-3 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Prosjekter</p>
              {(erf.projects || []).map((proj, pi) => (
                <div key={pi} className="space-y-2 bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      label="Fra (YYYY-MM)"
                      value={proj.fraDate}
                      onChange={(e) => {
                        const updated = [...form.erfaring];
                        updated[i].projects[pi].fraDate = e.target.value;
                        setForm({ ...form, erfaring: updated });
                      }}
                      placeholder="2025-06"
                    />
                    <Input
                      label="Til (YYYY-MM)"
                      value={proj.tilDate}
                      onChange={(e) => {
                        const updated = [...form.erfaring];
                        updated[i].projects[pi].tilDate = e.target.value;
                        setForm({ ...form, erfaring: updated });
                      }}
                      placeholder="2025-11"
                    />
                  </div>
                  <Input
                    label="Prosjekttittel"
                    value={proj.tittel}
                    onChange={(e) => {
                      const updated = [...form.erfaring];
                      updated[i].projects[pi].tittel = e.target.value;
                      setForm({ ...form, erfaring: updated });
                    }}
                    placeholder="f.eks. Upgrade of installation – Åsgard C"
                  />
                  <Input
                    label="Rolle"
                    value={proj.rolle}
                    onChange={(e) => {
                      const updated = [...form.erfaring];
                      updated[i].projects[pi].rolle = e.target.value;
                      setForm({ ...form, erfaring: updated });
                    }}
                    placeholder="f.eks. Electrical Supervisor"
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Beskrivelse</label>
                    <textarea
                      value={proj.beskrivelse}
                      onChange={(e) => {
                        const updated = [...form.erfaring];
                        updated[i].projects[pi].beskrivelse = e.target.value;
                        setForm({ ...form, erfaring: updated });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                      rows={2}
                      placeholder="Beskriv prosjektarbeidet..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...form.erfaring];
                      updated[i].projects.splice(pi, 1);
                      setForm({ ...form, erfaring: updated });
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Fjern prosjekt
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...form.erfaring];
                  updated[i].projects.push({ fraDate: "", tilDate: "", tittel: "", rolle: "", beskrivelse: "" });
                  setForm({ ...form, erfaring: updated });
                }}
                className="text-sm text-navy-900 hover:underline font-medium"
              >
                + Legg til prosjekt
              </button>
            </div>

            {form.erfaring.length > 1 && (
              <button
                type="button"
                onClick={() => removeListItem("erfaring", i)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Fjern erfaring
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            addListItem<Experience>("erfaring", { stilling: "", firma: "", fra: "", til: "", oppsummering: "", projects: [] })
          }
          className="text-sm text-navy-900 hover:underline font-medium"
        >
          + Legg til erfaring
        </button>
      </div>

      {/* Tilleggsinformasjon */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Tilleggsinformasjon</h3>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Språk</p>
          {form.spraak.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
              <Input
                label={`Språk ${i + 1}`}
                value={s.spraak}
                onChange={(e) => updateListItem<Language>("spraak", i, "spraak", e.target.value)}
                placeholder="f.eks. Engelsk"
              />
              <div className="space-y-1">
                <label htmlFor={`nivaa-${i}`} className="block text-sm font-medium text-gray-700">Nivå</label>
                <select
                  id={`nivaa-${i}`}
                  value={s.nivaa}
                  onChange={(e) => updateListItem<Language>("spraak", i, "nivaa", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                >
                  <option value="Morsmål">Morsmål</option>
                  <option value="Flytende">Flytende</option>
                  <option value="Profesjonelt">Profesjonelt</option>
                  <option value="Grunnleggende">Grunnleggende</option>
                </select>
              </div>
              {form.spraak.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem("spraak", i)}
                  className="text-red-500 hover:text-red-700 text-sm pb-1"
                >
                  Fjern
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem<Language>("spraak", { spraak: "", nivaa: "Grunnleggende" })}
            className="text-sm text-navy-900 hover:underline font-medium"
          >
            + Legg til språk
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Input
            label="Offshore-sertifikat gyldig til"
            type="date"
            value={form.offshoreSertifikatGyldigTil}
            onChange={(e) => update("offshoreSertifikatGyldigTil", e.target.value)}
          />
          <Input
            label="Førerkort kategorier"
            value={form.forerkortkategorier}
            onChange={(e) => update("forerkortkategorier", e.target.value)}
            placeholder="f.eks. B & AM"
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-4">
        Lagre CV og fortsett
      </Button>
    </form>
  );
}
