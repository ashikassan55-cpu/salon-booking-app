import { z } from "zod";
import { weeklyScheduleSchema } from "./working-hours";

export const siteSettingsSchema = z.object({
  name: z.string().trim().min(2, "Enter a salon name"),
  tagline: z.string().trim().min(2, "Enter a tagline"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, "Digits only, no + or leading 0"),
  address: z.string().trim().min(5, "Enter an address"),
  instagramUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  facebookUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color, e.g. #111111"),
  workingHours: weeklyScheduleSchema,
  googleReviewUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
