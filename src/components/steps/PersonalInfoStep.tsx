"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

function validatePersonnummer(value: string): string | undefined {
  const digits = value.replace(/\s/g, "");
  if (digits.length !== 11) return "Personnummer må være 11 siffer";
  if (!/^\d{11}$/.test(digits)) return "Personnummer kan kun inneholde tall";
  return undefined;
}

function validateBankAccount(value: string): string | undefined {
  const digits = value.replace(/[\s.]/g, "");
  if (digits.length !== 11) return "Kontonummer må være 11 siffer";
  if (!/^\d{11}$/.test(digits)) return "Kontonummer kan kun inneholde tall";
  return undefined;
}

export function PersonalInfoStep({ onComplete, data }: Props) {
  const [form, setForm] = useState({
    fullName: (data?.fullName as string) || "",
    personnummer: (data?.personnummer as string) || "",
    bankAccount: (data?.bankAccount as string) || "",
    nextOfKinName: (data?.nextOfKinName as string) || "",
    nextOfKinPhone: (data?.nextOfKinPhone as string) || "",
    nextOfKinRelation: (data?.nextOfKinRelation as string) || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const pnrError = validatePersonnummer(form.personnummer);
    if (pnrError) newErrors.personnummer = pnrError;

    const bankError = validateBankAccount(form.bankAccount);
    if (bankError) newErrors.bankAccount = bankError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onComplete(form);
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Fullt navn" name="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
      <Input label="Personnummer (11 siffer)" name="personnummer" type="password" autoComplete="off" value={form.personnummer} onChange={(e) => update("personnummer", e.target.value)} required error={errors.personnummer} inputMode="numeric" />
      <Input label="Kontonummer for lønn (11 siffer)" name="bankAccount" type="password" autoComplete="off" value={form.bankAccount} onChange={(e) => update("bankAccount", e.target.value)} required error={errors.bankAccount} inputMode="numeric" />

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-navy-900 mb-3">Nærmeste pårørende</h4>
        <div className="space-y-4">
          <Input label="Navn" name="nextOfKinName" value={form.nextOfKinName} onChange={(e) => update("nextOfKinName", e.target.value)} required />
          <Input label="Telefon" name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={(e) => update("nextOfKinPhone", e.target.value)} required type="tel" />
          <Input label="Relasjon" name="nextOfKinRelation" value={form.nextOfKinRelation} onChange={(e) => update("nextOfKinRelation", e.target.value)} required placeholder="f.eks. ektefelle, forelder" />
        </div>
      </div>

      <Button type="submit" className="w-full mt-4">Lagre og fortsett</Button>
    </form>
  );
}
