"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validation/review";

export type ReviewFormState = {
  error: string | null;
  success: boolean;
};

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "This review link isn't valid.",
  not_completed: "This booking hasn't been marked completed yet.",
  already_reviewed: "You've already submitted a review for this visit.",
  no_stylist: "This booking has no stylist on record — please contact the salon directly.",
};

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const result = reviewSchema.safeParse({
    token: formData.get("token"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Please check your rating",
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
    const message = row?.error_code ? ERROR_MESSAGES[row.error_code] : undefined;
    return {
      error: message ?? "Something went wrong submitting your review — please try again.",
      success: false,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { error: null, success: true };
}
