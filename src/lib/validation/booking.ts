import { z } from "zod";

export const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name"),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number"),
  serviceId: z.string().min(1, "Choose a service"),
  // A real staff.id, or the sentinel "any" for "Any Professional".
  staffId: z.string().min(1, "Choose a stylist"),
  date: z.date({ error: "Choose a date" }),
  time: z.string().min(1, "Choose a time"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
