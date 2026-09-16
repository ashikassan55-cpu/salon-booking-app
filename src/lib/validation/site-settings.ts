import { z } from "zod";
import type { getTranslations } from "next-intl/server";
import { weeklyScheduleSchema } from "./working-hours";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createSiteSettingsSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(2, t("siteSettings.nameMin")),
    tagline: z.string().trim().min(2, t("siteSettings.taglineMin")),
    email: z.string().trim().email(t("siteSettings.invalidEmail")),
    phone: z.string().trim().min(7, t("siteSettings.phoneMin")),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, t("siteSettings.whatsappDigitsOnly")),
    address: z.string().trim().min(5, t("siteSettings.addressMin")),
    instagramUrl: z
      .string()
      .trim()
      .url(t("siteSettings.invalidUrl"))
      .optional()
      .or(z.literal("")),
    facebookUrl: z
      .string()
      .trim()
      .url(t("siteSettings.invalidUrl"))
      .optional()
      .or(z.literal("")),
    accentColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, t("siteSettings.invalidHexColor")),
    workingHours: weeklyScheduleSchema,
    googleReviewUrl: z
      .string()
      .trim()
      .url(t("siteSettings.invalidUrl"))
      .optional()
      .or(z.literal("")),
  });
}

export type SiteSettingsInput = z.infer<ReturnType<typeof createSiteSettingsSchema>>;
