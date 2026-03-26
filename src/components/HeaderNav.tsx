"use client";

import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding");

  if (isOnboarding) return null;

  return (
    <nav className="text-sm text-navy-200">
      <a href="/admin" className="hover:text-white transition-colors">Admin</a>
    </nav>
  );
}
