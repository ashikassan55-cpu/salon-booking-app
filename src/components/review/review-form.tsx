"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/app/rate/[token]/actions";

const initialState: ReviewFormState = { error: null, success: false };

export function ReviewForm({
  token,
  stylistName,
  serviceName,
  googleReviewUrl,
}: {
  token: string;
  stylistName: string;
  serviceName: string;
  googleReviewUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.success) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Thank you for your feedback!</p>
        {rating >= 4 && googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            Share this on Google Reviews
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 text-center">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-lg font-semibold">
          Rate your visit with {stylistName}
        </p>
        <p className="mt-1 text-sm text-muted-dark">{serviceName}</p>
      </div>

      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-1 text-3xl transition-colors"
          >
            <span
              className={
                (hoverRating || rating) >= star
                  ? "text-yellow-400"
                  : "text-border-dark"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <div className="text-left">
        <label htmlFor="comment" className="text-sm font-medium">
          Comments (optional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="mt-2 w-full border border-border-dark bg-transparent p-2 text-sm outline-none focus:border-foreground-dark"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="w-full bg-accent px-6 py-3 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
