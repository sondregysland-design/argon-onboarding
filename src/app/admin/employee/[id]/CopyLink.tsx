"use client";

export function CopyLink({ url }: { url: string }) {
  async function copy() {
    await navigator.clipboard.writeText(url);
    alert("Lenke kopiert!");
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
      <code className="text-xs text-gray-600 max-w-xs truncate">{url}</code>
      <button onClick={copy} className="text-navy-900 hover:text-navy-700 text-sm font-medium whitespace-nowrap">
        Kopier
      </button>
    </div>
  );
}
