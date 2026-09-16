import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

function isSupportedLocale(value: string | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

/**
 * Every namespace partial gets merged into one messages tree per locale.
 * Each file's top-level key is the namespace passed to useTranslations()/
 * getTranslations() — this list grows as more of the app is translated
 * (see PLAN.md / the i18n rollout phases for the full namespace list).
 */
async function loadMessages(locale: AppLocale) {
  const [publicHeader, publicFooter, adminShell] = await Promise.all([
    import(`../../messages/${locale}/public-header.json`),
    import(`../../messages/${locale}/public-footer.json`),
    import(`../../messages/${locale}/admin-shell.json`),
  ]);

  return {
    ...publicHeader.default,
    ...publicFooter.default,
    ...adminShell.default,
  };
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
