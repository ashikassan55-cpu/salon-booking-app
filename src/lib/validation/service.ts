import { z } from "zod";
import type { getTranslations } from "next-intl/server";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createServiceSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(2, t("service.nameMin")),
    description: z
      .string()
      .trim()
      .max(500, t("service.descriptionMax"))
      .optional(),
    price: z.coerce.number().positive(t("service.priceInvalid")),
    duration_minutes: z.coerce
      .number()
      .int()
      .positive(t("service.durationInvalid")),
  });
}

export type ServiceInput = z.infer<ReturnType<typeof createServiceSchema>>;
