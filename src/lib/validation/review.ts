import { z } from "zod";
import type { getTranslations } from "next-intl/server";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createReviewSchema(t: Translator) {
  return z.object({
    token: z.string().uuid(),
    rating: z.coerce.number().int().min(1, t("review.ratingRequired")).max(5),
    comment: z
      .string()
      .trim()
      .max(1000, t("review.commentMax"))
      .optional(),
  });
}

export type ReviewInput = z.infer<ReturnType<typeof createReviewSchema>>;
