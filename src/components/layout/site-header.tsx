"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader({ siteName }: { siteName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-surface-dark text-foreground-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight uppercase">
          {siteName}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium tracking-wide uppercase md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground-dark/80 transition-colors hover:text-foreground-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#booking"
            className="hidden bg-accent px-4 py-2 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90 sm:inline-block"
          >
            {siteConfig.bookingCta}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center border border-border-dark md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-border-dark px-6 py-4 text-sm font-medium tracking-wide uppercase md:hidden">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-foreground-dark/80 transition-colors hover:text-foreground-dark"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-accent px-4 py-2 text-center text-xs font-semibold text-accent-foreground"
          >
            {siteConfig.bookingCta}
          </Link>
        </nav>
      )}
    </header>
  );
}
