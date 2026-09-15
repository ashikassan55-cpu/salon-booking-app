import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig, workingHoursByWeekday } from "@/lib/site-config";
import { getContrastColor } from "@/lib/color";

export type WorkingHourEntry = {
  weekday: number; // 0 = Sunday .. 6 = Saturday, matches Date.getDay()
  open: boolean;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  accentColor: string;
  accentForeground: string;
  workingHours: WorkingHourEntry[];
  googleReviewUrl: string | null;
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const DEFAULT_WORKING_HOURS: WorkingHourEntry[] = [0, 1, 2, 3, 4, 5, 6].map(
  (weekday) => {
    const h = workingHoursByWeekday[weekday];
    return {
      weekday,
      open: h.open,
      startHour: h.startHour,
      startMinute: 0,
      endHour: h.endHour,
      endMinute: 0,
    };
  },
);

const DEFAULT_SETTINGS: SiteSettings = {
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  whatsappNumber: siteConfig.contact.whatsappNumber,
  address: siteConfig.contact.address,
  instagramUrl: siteConfig.social.instagram || null,
  facebookUrl: siteConfig.social.facebook || null,
  // White-on-dark matches the public site's original CTA treatment — the
  // header/hero sections are dark, so a dark default accent would nearly
  // vanish into the background.
  accentColor: "#ffffff",
  accentForeground: getContrastColor("#ffffff"),
  workingHours: DEFAULT_WORKING_HOURS,
  googleReviewUrl: siteConfig.social.googleReviewUrl || null,
};

function isWorkingHours(value: unknown): value is WorkingHourEntry[] {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every(
      (entry) =>
        entry &&
        typeof entry.weekday === "number" &&
        typeof entry.open === "boolean" &&
        typeof entry.startHour === "number" &&
        typeof entry.endHour === "number",
    )
  );
}

/**
 * Fetches the single site_settings row, falling back to site-config.ts
 * defaults if the row doesn't exist yet or the query fails (e.g. the
 * migration hasn't been applied). Wrapped in React's cache() so multiple
 * calls within one request (layout + page) only hit the DB once.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!data) return DEFAULT_SETTINGS;

    const accentColor = HEX_COLOR_PATTERN.test(data.accent_color)
      ? data.accent_color
      : DEFAULT_SETTINGS.accentColor;

    return {
      name: data.name,
      tagline: data.tagline,
      email: data.contact_email,
      phone: data.contact_phone,
      whatsappNumber: data.whatsapp_number,
      address: data.address,
      instagramUrl: data.instagram_url,
      facebookUrl: data.facebook_url,
      accentColor,
      accentForeground: getContrastColor(accentColor),
      workingHours: isWorkingHours(data.working_hours)
        ? data.working_hours
        : DEFAULT_WORKING_HOURS,
      googleReviewUrl: data.google_review_url,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
