import type { WorkingHourEntry } from "@/lib/settings";

function hoursForDay(workingHours: WorkingHourEntry[], date: Date) {
  return workingHours.find((h) => h.weekday === date.getDay());
}

/** Local yyyy-mm-dd (not toISOString, which shifts to UTC and can flip the day). */
export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isPastDay(date: Date, today: Date) {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return date < startOfToday;
}

export function isDayOpen(workingHours: WorkingHourEntry[], date: Date) {
  return hoursForDay(workingHours, date)?.open ?? false;
}

/** Weeks of 7 cells (Sun-Sat) for the given month; cells outside the month are null. */
export function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** 30-minute time slots within the given day's working hours, e.g. "09:00". */
export function generateTimeSlots(
  workingHours: WorkingHourEntry[],
  date: Date,
  today: Date,
): string[] {
  const hours = hoursForDay(workingHours, date);
  if (!hours?.open) return [];

  const startTotalMinutes = hours.startHour * 60 + hours.startMinute;
  const endTotalMinutes = hours.endHour * 60 + hours.endMinute;

  const slots: string[] = [];
  for (
    let totalMinutes = startTotalMinutes;
    totalMinutes < endTotalMinutes;
    totalMinutes += 30
  ) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    if (isSameDay(date, today) && slotDate <= today) continue;
    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }
  return slots;
}
