import { z } from "zod";

/**
 * Shared by site-wide working hours (site_settings.working_hours) and
 * per-stylist weekly schedules (staff.schedule) — both use the exact same
 * shape, so they share one schema instead of maintaining two copies that
 * could drift apart.
 */
export const workingHourEntrySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  open: z.boolean(),
  startHour: z.number().int().min(0).max(23),
  startMinute: z.number().int().min(0).max(59),
  endHour: z.number().int().min(0).max(23),
  endMinute: z.number().int().min(0).max(59),
});

export const weeklyScheduleSchema = z.array(workingHourEntrySchema).length(7);
