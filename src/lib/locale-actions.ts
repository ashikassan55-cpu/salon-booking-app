"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type AppLocale } from "@/i18n/request";

/** Shared by both the public-site and admin language switchers. One year
 * expiry — a returning visitor keeps their chosen language. */
export async function setLocale(locale: AppLocale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
