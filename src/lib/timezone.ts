import { siteConfig } from "@/lib/site-config";

/**
 * Asia/Dubai is UTC+4 year-round (no DST), so a fixed offset is safe here.
 * If this template is ever reused for a client in a DST-observing
 * timezone, this needs to become a real IANA-aware conversion instead
 * (e.g. via a library like date-fns-tz) — a fixed offset would drift
 * twice a year.
 */
const SALON_UTC_OFFSET = "+04:00";
const SALON_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Combines a salon-local "yyyy-mm-dd" + "HH:mm" into the correct UTC instant. */
export function salonLocalToUtcDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00${SALON_UTC_OFFSET}`);
}

/** [start, end) UTC instants covering one salon-local calendar day. */
export function salonDayRangeUtc(dateStr: string): [Date, Date] {
  const start = salonLocalToUtcDate(dateStr, "00:00");
  return [start, new Date(start.getTime() + 24 * 60 * 60 * 1000)];
}

export function formatInSalonTimezone(
  date: Date,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: siteConfig.timezone,
    ...options,
  }).format(date);
}

function startOfSalonMonthOffset(reference: Date, monthOffset: number): Date {
  const wall = new Date(reference.getTime() + SALON_UTC_OFFSET_MS);
  const startWallMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth() + monthOffset,
    1,
  );
  return new Date(startWallMs - SALON_UTC_OFFSET_MS);
}

/** The UTC instant corresponding to the start of "today" in the salon's timezone. */
export function startOfSalonDay(reference: Date): Date {
  const wall = new Date(reference.getTime() + SALON_UTC_OFFSET_MS);
  const startWallMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate(),
  );
  return new Date(startWallMs - SALON_UTC_OFFSET_MS);
}

/** Start of the salon-local week (Sunday). */
export function startOfSalonWeek(reference: Date): Date {
  const wall = new Date(reference.getTime() + SALON_UTC_OFFSET_MS);
  const startWallMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate() - wall.getUTCDay(),
  );
  return new Date(startWallMs - SALON_UTC_OFFSET_MS);
}

export function startOfSalonMonth(reference: Date): Date {
  return startOfSalonMonthOffset(reference, 0);
}

export function startOfNextSalonMonth(reference: Date): Date {
  return startOfSalonMonthOffset(reference, 1);
}
