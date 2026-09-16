"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createLoginSchema } from "@/lib/validation/auth";

export type LoginState = {
  error: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const t = await getTranslations("AdminLogin");
  const tValidation = await getTranslations("Validation");
  const loginSchema = createLoginSchema(tValidation);

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: t("invalidCredentials") };
  }

  redirect("/admin");
}
