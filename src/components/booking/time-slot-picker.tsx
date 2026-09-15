"use client";

import { useEffect, useState } from "react";
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
    return (
      <p className="text-sm text-muted-dark">
        Pick a date to see available times.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-dark">Loading available times…</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-dark">
        No time slots left on this day — try another date.
      </p>
    );
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
