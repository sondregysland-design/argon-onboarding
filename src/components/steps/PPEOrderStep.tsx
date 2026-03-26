"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
  existingOrder: { shoeSize: string; coverallSize: string; tshirtSize: string } | null;
}

const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"];
const COVERALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function PPEOrderStep({ employeeId, onComplete, existingOrder }: Props) {
  const [form, setForm] = useState({
    shoeSize: existingOrder?.shoeSize || "",
    coverallSize: existingOrder?.coverallSize || "",
    tshirtSize: existingOrder?.tshirtSize || "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/ppe-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, ...form }),
      });
      setToast("Bestilling sendt! Verneutstyr er på vei.");
      setTimeout(() => onComplete(form), 1500);
    } catch {
      setToast("Kunne ikke sende bestilling. Prøv igjen.");
      setLoading(false);
    }
  }

  const clearToast = useCallback(() => setToast(null), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast && <Toast message={toast} onClose={clearToast} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Bedriften følger kundens retningslinjer for bruk av verneutstyr. Bestillingen sendes direkte til leverandør og ansvarlig på kontoret.
      </div>

      <div className="space-y-1">
        <label htmlFor="shoeSize" className="block text-sm font-medium text-gray-700">Skostørrelse <span className="text-red-500">*</span></label>
        <select id="shoeSize" name="shoeSize" value={form.shoeSize} onChange={(e) => setForm({ ...form, shoeSize: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
          <option value="">Velg...</option>
          {SHOE_SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="coverallSize" className="block text-sm font-medium text-gray-700">Kjeledress-størrelse <span className="text-red-500">*</span></label>
        <select id="coverallSize" name="coverallSize" value={form.coverallSize} onChange={(e) => setForm({ ...form, coverallSize: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
          <option value="">Velg...</option>
          {COVERALL_SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="tshirtSize" className="block text-sm font-medium text-gray-700">T-skjorte-størrelse <span className="text-red-500">*</span></label>
        <select id="tshirtSize" name="tshirtSize" value={form.tshirtSize} onChange={(e) => setForm({ ...form, tshirtSize: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
          <option value="">Velg...</option>
          {TSHIRT_SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sender bestilling..." : "Send bestilling"}
      </Button>
    </form>
  );
}
