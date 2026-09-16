"use client";

import { useActionState, useMemo, useState } from "react";
import type { BookingStylist, Service } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";
import { toDateInputValue } from "@/lib/calendar";
import { formatCurrency } from "@/lib/currency";
import { getEffectivePrice, unionWorkingHours } from "@/lib/availability";
import { submitBooking, type BookingState } from "./actions";
import { CalendarPicker } from "./calendar-picker";
import { TimeSlotPicker } from "./time-slot-picker";
import { StylistPicker, type EligibleStylist } from "./stylist-picker";

type StaffServicePricing = {
  staff_id: string;
  service_id: string;
  custom_price: number | null;
};

type BookingFormProps = {
  services: Service[];
  staff: BookingStylist[];
  staffServices: StaffServicePricing[];
  workingHours: WorkingHourEntry[];
};

const ANY_PROFESSIONAL = "any";

const initialState: BookingState = { error: null };

export function BookingForm({
  services,
  staff,
  staffServices,
  workingHours,
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState(
    submitBooking,
    initialState,
  );

  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  const eligibleStylists: EligibleStylist[] = useMemo(() => {
    if (!selectedService) return [];
    return staffServices
      .filter((ss) => ss.service_id === selectedService.id)
      .map((ss) => {
        const person = staff.find((s) => s.id === ss.staff_id);
        if (!person) return null;
        const eligible: EligibleStylist = {
          id: person.id,
          name: person.name,
          role: person.role,
          photoUrl: person.photoUrl,
          avgRating: person.avgRating,
          reviewCount: person.reviewCount,
          price: getEffectivePrice(selectedService.price, ss.custom_price),
        };
        return eligible;
      })
      .filter((s): s is EligibleStylist => s !== null);
  }, [selectedService, staff, staffServices]);

  const cheapestPrice = useMemo(
    () =>
      eligibleStylists.length > 0
        ? Math.min(...eligibleStylists.map((s) => s.price))
        : null,
    [eligibleStylists],
  );

  const activeSchedule = useMemo(() => {
    if (!staffId) return workingHours;
    if (staffId === ANY_PROFESSIONAL) {
      const schedules = eligibleStylists
        .map((s) => staff.find((p) => p.id === s.id)?.schedule)
        .filter((s): s is WorkingHourEntry[] => !!s);
      return schedules.length > 0 ? unionWorkingHours(schedules) : workingHours;
    }
    return staff.find((p) => p.id === staffId)?.schedule ?? workingHours;
  }, [staffId, eligibleStylists, staff, workingHours]);

  function handleSelectService(newServiceId: string) {
    setServiceId(newServiceId);
    // Any Professional is the sensible default the moment a service is
    // picked — fewer required taps for customers who don't care who
    // serves them, while still letting them switch to a named stylist.
    setStaffId(newServiceId ? ANY_PROFESSIONAL : "");
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function handleSelectStaff(newStaffId: string) {
    setStaffId(newStaffId);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-2">
      <input type="hidden" name="staffId" value={staffId} />
      <input
        type="hidden"
        name="date"
        value={selectedDate ? toDateInputValue(selectedDate) : ""}
      />
      <input type="hidden" name="time" value={selectedTime ?? ""} />

      <div className="space-y-6">
        <div>
          <label htmlFor="customerName" className="text-sm font-medium">
            Your Name
          </label>
          <input
            id="customerName"
            name="customerName"
            className="mt-2 w-full border-b border-border-dark bg-transparent py-2 text-sm outline-none focus:border-foreground-dark"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="text-sm font-medium">
            Your Phone
          </label>
          <input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            className="mt-2 w-full border-b border-border-dark bg-transparent py-2 text-sm outline-none focus:border-foreground-dark"
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="serviceId" className="text-sm font-medium">
            Choose Service
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={serviceId}
            onChange={(e) => handleSelectService(e.target.value)}
            className="mt-2 w-full border-b border-border-dark bg-transparent py-2 text-sm outline-none focus:border-foreground-dark"
          >
            <option value="" className="bg-surface-dark">
              Select a service
            </option>
            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
                className="bg-surface-dark"
              >
                {service.name}
              </option>
            ))}
          </select>
          {selectedService && (
            <p className="mt-2 text-xs text-muted-dark">
              {selectedService.duration_minutes} min &middot;{" "}
              {formatCurrency(selectedService.price, false)}
            </p>
          )}
        </div>

        {selectedService && (
          <div>
            <p className="text-sm font-medium">Choose Stylist</p>
            <div className="mt-2">
              <StylistPicker
                stylists={eligibleStylists}
                cheapestPrice={cheapestPrice}
                selectedStaffId={staffId}
                onSelect={handleSelectStaff}
              />
            </div>
          </div>
        )}

        {staffId && (
          <div>
            <p className="text-sm font-medium">Choose Time</p>
            <div className="mt-2">
              <TimeSlotPicker
                serviceId={serviceId}
                staffId={staffId}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {staffId && (
          <>
            <p className="text-sm font-medium">Choose Date</p>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              workingHours={activeSchedule}
            />
          </>
        )}

        {state.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-accent px-6 py-3 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Booking..." : "Book an Appointment"}
        </button>
      </div>
    </form>
  );
}
