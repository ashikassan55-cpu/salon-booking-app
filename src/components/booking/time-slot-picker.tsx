"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toDateInputValue } from "@/lib/calendar";
import { getAvailableSlots } from "./actions";

type TimeSlotPickerProps = {
  serviceId: string;
  staffId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export function TimeSlotPicker({
  serviceId,
  staffId,
  selectedDate,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("PublicBooking");

  useEffect(() => {
    if (!selectedDate || !serviceId || !staffId) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAvailableSlots(serviceId, staffId, toDateInputValue(selectedDate))
      .then((result) => {
        if (!cancelled) setSlots(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, selectedDate]);

  if (!selectedDate) {
    return <p className="text-sm text-muted-dark">{t("pickDateForTimes")}</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-dark">{t("loadingTimes")}</p>;
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-dark">{t("noTimesLeft")}</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelectTime(slot)}
          className={`border px-3 py-2 text-sm transition-colors ${
            selectedTime === slot
              ? "border-foreground-dark bg-foreground-dark text-surface-dark"
              : "border-border-dark hover:bg-foreground-dark/10"
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
