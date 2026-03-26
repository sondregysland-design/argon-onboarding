"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        startDate: formData.get("startDate"),
      }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setLoading(false);
      alert("Kunne ikke opprette ansatt. Prøv igjen.");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Ny ansatt</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Fullt navn" name="name" required />
          <Input label="E-post" name="email" type="email" required />
          <Input label="Telefon" name="phone" type="tel" />
          <Input label="Startdato" name="startDate" type="date" required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Oppretter..." : "Opprett ansatt"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Avbryt
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
