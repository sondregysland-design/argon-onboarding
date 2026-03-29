"use client";

import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding");

  if (isOnboarding) return null;

  return (
    <nav className="text-sm">
      <a href="/admin" className="font-medium text-text-light hover:text-primary transition-colors">Admin</a>
    </nav>
  );
}
