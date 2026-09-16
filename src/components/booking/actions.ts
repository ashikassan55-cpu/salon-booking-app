"use server";

import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { formatInSalonTimezone, salonDayRangeUtc, salonLocalToUtcDate } from "@/lib/timezone";
import { createBookingSchema } from "@/lib/validation/booking";
import {
  computeStaffAvailableSlots,
  getEffectivePrice,
  isStaffFreeAt,
  type ExistingBookingSlot,
} from "@/lib/availability";
import type { WorkingHourEntry } from "@/lib/settings";

export type BookingState = {
  error: string | null;
};

/** Sentinel staffId meaning "no preference — assign whoever's cheapest and free". */
const ANY_PROFESSIONAL = "any";

type EligibleStylist = {
  staffId: string;
  name: string;
  createdAt: string;
  customPrice: number | null;
};

async function getEligibleStylists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  serviceId: string,
): Promise<EligibleStylist[]> {
  const { data } = await supabase
    .from("staff_services")
    .select("staff_id, custom_price, staff(id, name, is_active, created_at)")
    .eq("service_id", serviceId);

  return (data ?? [])
    .filter((row) => row.staff && row.staff.is_active)
    .map((row) => ({
      staffId: row.staff_id,
      name: row.staff!.name,
      createdAt: row.staff!.created_at,
      customPrice: row.custom_price,
    }));
}

async function getExistingBookingsForDay(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffIds: string[],
  dateStr: string,
): Promise<ExistingBookingSlot[]> {
  if (staffIds.length === 0) return [];
  const [dayStart, dayEnd] = salonDayRangeUtc(dateStr);
  const { data } = await supabase
    .from("bookings")
    .select("staff_id, service_date, service_duration_snapshot, status")
    .in("staff_id", staffIds)
    .gte("service_date", dayStart.toISOString())
    .lt("service_date", dayEnd.toISOString());
  return data ?? [];
}

/**
 * Slots to show the customer while browsing: for a named stylist, just
 * their own availability; for "Any Professional", the union across every
 * eligible stylist (a time is shown if at least one of them is free then).
 */
export async function getAvailableSlots(
  serviceId: string,
  staffId: string,
  dateStr: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();
  if (!service) return [];

  const eligible = await getEligibleStylists(supabase, serviceId);
  const today = new Date();

  if (staffId !== ANY_PROFESSIONAL) {
    const stylist = eligible.find((s) => s.staffId === staffId);
    if (!stylist) return [];

    const { data: staffRow } = await supabase
      .from("staff")
      .select("schedule")
      .eq("id", staffId)
      .single();
    if (!staffRow) return [];

    const existingBookings = await getExistingBookingsForDay(
      supabase,
      [staffId],
      dateStr,
    );

    return computeStaffAvailableSlots({
      schedule: staffRow.schedule as WorkingHourEntry[],
      dateStr,
      today,
      durationMinutes: service.duration_minutes,
      staffId,
      existingBookings,
    });
  }

  if (eligible.length === 0) return [];

  const staffIds = eligible.map((s) => s.staffId);
  const [{ data: staffRows }, existingBookings] = await Promise.all([
    supabase.from("staff").select("id, schedule").in("id", staffIds),
    getExistingBookingsForDay(supabase, staffIds, dateStr),
  ]);

  const scheduleById = new Map(
    (staffRows ?? []).map((row) => [row.id, row.schedule as WorkingHourEntry[]]),
  );

  const union = new Set<string>();
  for (const stylist of eligible) {
    const schedule = scheduleById.get(stylist.staffId);
    if (!schedule) continue;
    const slots = computeStaffAvailableSlots({
      schedule,
      dateStr,
      today,
      durationMinutes: service.duration_minutes,
      staffId: stylist.staffId,
      existingBookings,
    });
    slots.forEach((s) => union.add(s));
  }

  return Array.from(union).sort();
}

export async function submitBooking(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const dateStr = formData.get("date");
  const timeStr = formData.get("time");

  const parsedDate =
    typeof dateStr === "string" && typeof timeStr === "string" && dateStr && timeStr
      ? salonLocalToUtcDate(dateStr, timeStr)
      : undefined;

  const tValidation = await getTranslations("Validation");
  const bookingSchema = createBookingSchema(tValidation);

  const result = bookingSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId"),
    date: parsedDate,
    time: timeStr,
  });

  const t = await getTranslations("PublicBooking");

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? t("checkForm") };
  }

  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes")
    .eq("id", result.data.serviceId)
    .single();

  if (serviceError || !service) {
    return { error: t("serviceUnavailable") };
  }

  const eligible = await getEligibleStylists(supabase, service.id);
  const dateOnly = (typeof dateStr === "string" ? dateStr : "") as string;

  let resolvedStaffId: string;
  let resolvedStaffName: string;
  let effectivePrice: number;

  if (result.data.staffId === ANY_PROFESSIONAL) {
    if (eligible.length === 0) {
      return { error: t("noStylistForService") };
    }

    const existingBookings = await getExistingBookingsForDay(
      supabase,
      eligible.map((s) => s.staffId),
      dateOnly,
    );

    const free = eligible
      .filter((s) =>
        isStaffFreeAt(s.staffId, result.data.date, service.duration_minutes, existingBookings),
      )
      .sort((a, b) => {
        const priceDiff =
          getEffectivePrice(service.price, a.customPrice) -
          getEffectivePrice(service.price, b.customPrice);
        if (priceDiff !== 0) return priceDiff;
        return a.createdAt.localeCompare(b.createdAt);
      });

    if (free.length === 0) {
      return { error: t("slotTaken") };
    }

    resolvedStaffId = free[0].staffId;
    resolvedStaffName = free[0].name;
    effectivePrice = getEffectivePrice(service.price, free[0].customPrice);
  } else {
    const stylist = eligible.find((s) => s.staffId === result.data.staffId);
    if (!stylist) {
      return { error: t("stylistUnavailable") };
    }

    const existingBookings = await getExistingBookingsForDay(
      supabase,
      [stylist.staffId],
      dateOnly,
    );

    if (
      !isStaffFreeAt(
        stylist.staffId,
        result.data.date,
        service.duration_minutes,
        existingBookings,
      )
    ) {
      return { error: t("slotTaken") };
    }

    resolvedStaffId = stylist.staffId;
    resolvedStaffName = stylist.name;
    effectivePrice = getEffectivePrice(service.price, stylist.customPrice);
  }

  const { error: insertError } = await supabase.from("bookings").insert({
    customer_name: result.data.customerName,
    customer_phone: result.data.customerPhone,
    service_id: service.id,
    service_name_snapshot: service.name,
    service_price_snapshot: effectivePrice,
    service_duration_snapshot: service.duration_minutes,
    service_date: result.data.date.toISOString(),
    staff_id: resolvedStaffId,
    staff_name_snapshot: resolvedStaffName,
  });

  if (insertError) {
    return { error: t("submissionError") };
  }

  const locale = await getLocale();
  const dateLocale = locale === "ar" ? "ar-AE" : "en-US";

  const formattedDate = formatInSalonTimezone(
    result.data.date,
    { dateStyle: "medium" },
    dateLocale,
  );
  const formattedTime = formatInSalonTimezone(
    result.data.date,
    { hour: "2-digit", minute: "2-digit", hour12: true },
    dateLocale,
  );

  const settings = await getSiteSettings();

  const message = `${t("whatsapp.title")}\n${t("whatsapp.name")} ${result.data.customerName}\n${t("whatsapp.phone")} ${result.data.customerPhone}\n${t("whatsapp.service")} ${service.name}\n${t("whatsapp.stylist")} ${resolvedStaffName}\n${t("whatsapp.date")} ${formattedDate} ${t("whatsapp.at")} ${formattedTime}\n\n${t("whatsapp.confirm")}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;

  redirect(whatsappUrl);
}
