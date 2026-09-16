"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/lib/locale-actions";
import type { AppLocale } from "@/i18n/request";

export function AdminLanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("AdminShell");
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
    <div className="flex items-center border border-admin-border font-admin-display text-[11px] font-bold tracking-widest uppercase">
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        aria-current={locale === "en"}
        className={`flex-1 px-2 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-admin-accent text-admin-accent-ink"
            : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
        }`}
      >
        {t("languageEnglish")}
      </button>
      <button
        type="button"
        onClick={() => switchTo("ar")}
        disabled={pending}
        aria-current={locale === "ar"}
        className={`flex-1 px-2 py-1.5 transition-colors ${
          locale === "ar"
            ? "bg-admin-accent text-admin-accent-ink"
            : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
        }`}
      >
        {t("languageArabic")}
      </button>
    </div>
  );
}
