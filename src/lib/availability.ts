import { generateTimeSlots } from "@/lib/calendar";
import { salonLocalToUtcDate } from "@/lib/timezone";
import type { WorkingHourEntry } from "@/lib/settings";

/** The minimal shape of an existing booking needed for conflict-checking —
 * deliberately not the full Booking type, so callers can select just these
 * columns. */
export type ExistingBookingSlot = {
  staff_id: string | null;
  service_date: string;
  service_duration_snapshot: number;
  status: string;
};

export function getEffectivePrice(
  basePrice: number,
  customPrice: number | null | undefined,
): number {
  return customPrice ?? basePrice;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** Is this stylist free for [slotStartUtc, slotStartUtc + durationMinutes)? */
export function isStaffFreeAt(
  staffId: string,
  slotStartUtc: Date,
  durationMinutes: number,
  existingBookings: ExistingBookingSlot[],
): boolean {
  const slotStart = slotStartUtc.getTime();
  const slotEnd = slotStart + durationMinutes * 60_000;

  return !existingBookings.some((booking) => {
    if (booking.staff_id !== staffId) return false;
    if (booking.status === "cancelled") return false;

    const bookingStart = new Date(booking.service_date).getTime();
    const bookingEnd =
      bookingStart + booking.service_duration_snapshot * 60_000;

    return rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
  });
}

/**
 * A stylist's real bookable time slots for one salon-local day: starts from
 * their own weekly schedule (generateTimeSlots, already generic over any
 * WorkingHourEntry[]), then filters out any slot that would overlap a
 * booking they already have.
 */
export function computeStaffAvailableSlots({
  schedule,
  dateStr,
  today,
  durationMinutes,
  staffId,
  existingBookings,
}: {
  schedule: WorkingHourEntry[];
  dateStr: string;
  today: Date;
  durationMinutes: number;
  staffId: string;
  existingBookings: ExistingBookingSlot[];
}): string[] {
  // generateTimeSlots only needs the date for its weekday + "is this today"
  // check — a plain local Date constructed from the date string is enough,
  // matching how CalendarPicker already produces the dates it hands to it.
  const [year, month, day] = dateStr.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  const rawSlots = generateTimeSlots(schedule, localDate, today);

  return rawSlots.filter((time) => {
    const slotStartUtc = salonLocalToUtcDate(dateStr, time);
    return isStaffFreeAt(staffId, slotStartUtc, durationMinutes, existingBookings);
  });
}

/** Per-weekday OR of "open" plus the widest open span across a set of
 * stylists' schedules — used to decide which calendar days look open at
 * all when "Any Professional" is selected (a day is worth showing if at
 * least one eligible stylist works that day). */
export function unionWorkingHours(
  schedules: WorkingHourEntry[][],
): WorkingHourEntry[] {
  const byWeekday = new Map<number, WorkingHourEntry>();

  for (const schedule of schedules) {
    for (const entry of schedule) {
      if (!entry.open) continue;
      const existing = byWeekday.get(entry.weekday);
      if (!existing) {
        byWeekday.set(entry.weekday, { ...entry });
        continue;
      }
      const existingStart = existing.startHour * 60 + existing.startMinute;
      const entryStart = entry.startHour * 60 + entry.startMinute;
      const existingEnd = existing.endHour * 60 + existing.endMinute;
      const entryEnd = entry.endHour * 60 + entry.endMinute;

      if (entryStart < existingStart) {
        existing.startHour = entry.startHour;
        existing.startMinute = entry.startMinute;
      }
      if (entryEnd > existingEnd) {
        existing.endHour = entry.endHour;
        existing.endMinute = entry.endMinute;
      }
    }
  }

  return Array.from({ length: 7 }, (_, weekday) => {
    const entry = byWeekday.get(weekday);
    return (
      entry ?? {
        weekday,
        open: false,
        startHour: 0,
        startMinute: 0,
        endHour: 0,
        endMinute: 0,
      }
    );
  });
}
