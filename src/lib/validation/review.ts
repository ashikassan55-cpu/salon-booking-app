import { z } from "zod";

export const reviewSchema = z.object({
  token: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  comment: z
    .string()
    .trim()
    .max(1000, "Keep your comment under 1000 characters")
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
