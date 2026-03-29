import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";
import { LogoIcon } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Argon Onboarding | Oppstartskurs for nyansatte",
  description: "Oppstartskurs og onboarding for nyansatte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 print:hidden">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/admin" className="flex items-center gap-2">
              <LogoIcon className="h-8 w-8" />
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-primary">ARGON</span>
                <span className="text-xl font-light text-text-light">Solutions</span>
              </div>
            </a>
            <HeaderNav />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
