"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  getMonthMatrix,
  isDayOpen,
  isPastDay,
  isSameDay,
} from "@/lib/calendar";
import type { WorkingHourEntry } from "@/lib/settings";

type CalendarPickerProps = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  workingHours: WorkingHourEntry[];
};

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  workingHours,
}: CalendarPickerProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const locale = useLocale();
  const t = useTranslations("PublicBooking");
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2024-01-07 is a Sunday — a fixed reference week to read weekday names from.
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2024, 0, 7 + i)),
    );
  }, [locale]);

  const weeks = useMemo(
    () => getMonthMatrix(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  );

  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  return (
    <div className="border border-border-dark p-4">
      <div className="flex items-center justify-between pb-4">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={() =>
            setVisibleMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
            )
          }
          className="h-8 w-8 border border-border-dark text-sm rtl:-scale-x-100 disabled:opacity-30"
          aria-label={t("previousMonth")}
        >
          ←
        </button>
        <p className="text-sm font-semibold tracking-wide uppercase">
          {monthLabel.format(visibleMonth)}
        </p>
        <button
          type="button"
          onClick={() =>
            setVisibleMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
            )
          }
          className="h-8 w-8 border border-border-dark text-sm rtl:-scale-x-100"
          aria-label={t("nextMonth")}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-dark">
        {weekdayLabels.map((label, i) => (
          <div key={i} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const key = `${weekIndex}-${dayIndex}`;
            if (!date) return <div key={key} />;

            const disabled =
              isPastDay(date, today) || !isDayOpen(workingHours, date);
            const selected = selectedDate && isSameDay(date, selectedDate);

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(date)}
                className={`aspect-square text-sm transition-colors ${
                  selected
                    ? "bg-foreground-dark text-surface-dark"
                    : disabled
                      ? "text-muted-dark/40"
                      : "hover:bg-foreground-dark/10"
                }`}
              >
                {date.getDate()}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
