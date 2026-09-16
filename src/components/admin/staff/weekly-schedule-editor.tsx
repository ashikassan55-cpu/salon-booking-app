"use client";

import { useTranslations } from "next-intl";
import type { WorkingHourEntry } from "@/lib/settings";

function timeToMinutes(h: number, m: number) {
  return h * 60 + m;
}

function minutesToTimeValue(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * One row per weekday with an Open/Closed toggle + start/end time inputs.
 * Shared between the Site Settings "Working Hours" section (salon-wide
 * default) and each stylist's own weekly schedule in the Staff drawer —
 * both use the identical WorkingHourEntry[] shape.
 */
export function WeeklyScheduleEditor({
  value,
  onChange,
}: {
  value: WorkingHourEntry[];
  onChange: (updated: WorkingHourEntry[]) => void;
}) {
  const t = useTranslations("AdminShell");

  function updateDay(weekday: number, patch: Partial<WorkingHourEntry>) {
    onChange(
      value.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)),
    );
  }

  return (
    <div className="divide-y divide-admin-border">
      {value.map((day) => (
        <div
          key={day.weekday}
          className="flex flex-wrap items-center gap-3 py-2.5"
        >
          <span className="w-24 font-admin-display text-xs font-bold tracking-wider text-admin-ink uppercase">
            {t(`weekdays.${day.weekday}`)}
          </span>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={day.open}
              onChange={(e) =>
                updateDay(day.weekday, { open: e.target.checked })
              }
              className="h-4 w-4 accent-admin-accent"
            />
            <span
              className={`border px-1.5 py-0.5 font-admin-display text-[10px] font-bold tracking-wider uppercase ${
                day.open
                  ? "border-admin-accent bg-admin-accent text-admin-accent-ink"
                  : "border-admin-border text-admin-muted"
              }`}
            >
              {day.open ? t("schedule.open") : t("schedule.closed")}
            </span>
          </label>

          <input
            type="time"
            disabled={!day.open}
            value={minutesToTimeValue(
              timeToMinutes(day.startHour, day.startMinute),
            )}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              updateDay(day.weekday, { startHour: h, startMinute: m });
            }}
            className="border border-admin-border bg-admin-bg px-2 py-1 text-xs disabled:opacity-40"
          />
          <span className="text-xs text-admin-muted">{t("schedule.to")}</span>
          <input
            type="time"
            disabled={!day.open}
            value={minutesToTimeValue(
              timeToMinutes(day.endHour, day.endMinute),
            )}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              updateDay(day.weekday, { endHour: h, endMinute: m });
            }}
            className="border border-admin-border bg-admin-bg px-2 py-1 text-xs disabled:opacity-40"
          />
        </div>
      ))}
    </div>
  );
}
