import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Enter a service name"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters")
    .optional(),
  price: z.coerce.number().positive("Enter a valid price"),
  duration_minutes: z.coerce
    .number()
    .int()
    .positive("Enter a valid duration"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
