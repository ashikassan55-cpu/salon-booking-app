"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validation/review";

export type ReviewFormState = {
  error: string | null;
  success: boolean;
};

const ERROR_CODE_KEYS: Record<string, string> = {
  not_found: "notFound",
  not_completed: "notCompleted",
  already_reviewed: "alreadyReviewed",
  no_stylist: "noStylist",
};

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const t = await getTranslations("PublicReview.errors");

  const result = reviewSchema.safeParse({
    token: formData.get("token"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? t("checkRating"),
      success: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_review", {
    p_token: result.data.token,
    p_rating: result.data.rating,
    p_comment: result.data.comment ?? null,
  });

  const row = data?.[0];

  if (error || !row || !row.ok) {
    const key = row?.error_code ? ERROR_CODE_KEYS[row.error_code] : undefined;
    return {
      error: key ? t(key) : t("generic"),
      success: false,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { error: null, success: true };
}
