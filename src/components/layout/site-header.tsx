"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ siteName }: { siteName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("PublicHeader");

  const nav = [
    { key: "home", href: "/" },
    { key: "services", href: "#services" },
    { key: "gallery", href: "#gallery" },
    { key: "contact", href: "#contact" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-surface-dark text-foreground-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight uppercase">
          {siteName}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium tracking-wide uppercase md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground-dark/80 transition-colors hover:text-foreground-dark"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher className="hidden sm:flex" />

          <Link
            href="#booking"
            className="hidden bg-accent px-4 py-2 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90 sm:inline-block"
          >
            {t("bookNow")}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={t("toggleMenu")}
            className="flex h-9 w-9 items-center justify-center border border-border-dark md:hidden"
          >
            <span className="sr-only">{t("toggleMenu")}</span>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-border-dark px-6 py-4 text-sm font-medium tracking-wide uppercase md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-foreground-dark/80 transition-colors hover:text-foreground-dark"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <Link
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-accent px-4 py-2 text-center text-xs font-semibold text-accent-foreground"
          >
            {t("bookNow")}
          </Link>
          <LanguageSwitcher className="mt-4 justify-center" />
        </nav>
      )}
    </header>
  );
}
