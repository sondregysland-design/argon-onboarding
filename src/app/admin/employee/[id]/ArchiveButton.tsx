"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveButton({ employeeId, archived }: { employeeId: string; archived: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      if (archived) {
        // Reactivate
        await fetch(`/api/employees/${employeeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: false }),
        });
      } else {
        // Archive (soft delete)
        await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  if (archived) {
    return (
      <button
        onClick={handleAction}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50"
      >
        {loading ? "Gjenaktiverer..." : confirming ? "Bekreft gjenaktivering" : "Gjenaktiver"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {confirming && (
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Avbryt
        </button>
      )}
      <button
        onClick={handleAction}
        disabled={loading}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirming ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
      >
        {loading ? "Arkiverer..." : confirming ? "Bekreft arkivering" : "Deaktiver ansatt"}
      </button>
    </div>
  );
}
