"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/lib/locale-actions";
import type { AppLocale } from "@/i18n/request";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("PublicHeader");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      className={`flex items-center gap-1 text-xs font-semibold tracking-wide uppercase ${className}`}
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        aria-current={locale === "en"}
        className={`px-1.5 py-1 transition-colors ${
          locale === "en"
            ? "text-foreground-dark"
            : "text-foreground-dark/50 hover:text-foreground-dark"
        }`}
      >
        {t("languageEnglish")}
      </button>
      <span className="text-foreground-dark/30">/</span>
      <button
        type="button"
        onClick={() => switchTo("ar")}
        disabled={pending}
        aria-current={locale === "ar"}
        className={`px-1.5 py-1 transition-colors ${
          locale === "ar"
            ? "text-foreground-dark"
            : "text-foreground-dark/50 hover:text-foreground-dark"
        }`}
      >
        {t("languageArabic")}
      </button>
    </div>
  );
}
