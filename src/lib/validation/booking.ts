import { z } from "zod";
import type { getTranslations } from "next-intl/server";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createBookingSchema(t: Translator) {
  return z.object({
    customerName: z.string().trim().min(2, t("booking.nameMin")),
    customerPhone: z
      .string()
      .trim()
      .min(7, t("booking.phoneInvalid"))
      .regex(/^[0-9+()\-\s]+$/, t("booking.phoneInvalid")),
    serviceId: z.string().min(1, t("booking.serviceRequired")),
    // A real staff.id, or the sentinel "any" for "Any Professional".
    staffId: z.string().min(1, t("booking.stylistRequired")),
    date: z.date({ error: t("booking.dateRequired") }),
    time: z.string().min(1, t("booking.timeRequired")),
  });
}

export type BookingInput = z.infer<ReturnType<typeof createBookingSchema>>;
