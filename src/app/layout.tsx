import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "Onboarding | Oppstartskurs for nyansatte",
  description: "Oppstartskurs og onboarding for nyansatte i bedriften",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-navy-900 text-white shadow-lg print:hidden">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Onboarding</h1>
            <HeaderNav />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
