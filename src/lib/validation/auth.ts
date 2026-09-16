import { z } from "zod";
import type { getTranslations } from "next-intl/server";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createLoginSchema(t: Translator) {
  return z.object({
    email: z.string().trim().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMin")),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
