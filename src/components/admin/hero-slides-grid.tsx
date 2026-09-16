"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { HeroSlideRow } from "@/lib/supabase/database.types";
import {
  deleteHeroSlide,
  moveHeroSlide,
  updateHeroSlideCaption,
  type CaptionState,
} from "@/app/admin/(shell)/hero/actions";

const initialCaptionState: CaptionState = { error: null };

function HeroSlideCard({
  slide,
  isFirst,
  isLast,
}: {
  slide: HeroSlideRow;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("AdminHero.card");
  const updateCaptionForSlide = updateHeroSlideCaption.bind(null, slide.id);
  const [state, formAction, pending] = useActionState(
    updateCaptionForSlide,
    initialCaptionState,
  );
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [moving, setMoving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // An inline two-step confirm instead of window.confirm() — native confirm
  // dialogs aren't always reliable (can be suppressed by the browser or
  // silently dismissed), and a suppressed dialog means the delete call
  // never even fires with zero feedback, which looks exactly like "delete
  // doesn't work."
  async function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteHeroSlide(slide.id, slide.image_url);
    setDeleting(false);
    setConfirmingDelete(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleMove(direction: "up" | "down") {
    setMoving(true);
    await moveHeroSlide(slide.id, direction);
    setMoving(false);
    router.refresh();
  }

  return (
    <div className="border border-admin-border bg-admin-surface">
      <div className="relative aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, not a build-time asset */}
        <img
          src={slide.image_url}
          alt={slide.caption ?? ""}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 end-2 flex gap-1">
          <button
            type="button"
            onClick={() => handleMove("up")}
            disabled={isFirst || moving}
            className="bg-black/60 px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-admin-accent disabled:opacity-30"
            title={t("moveEarlier")}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => handleMove("down")}
            disabled={isLast || moving}
            className="bg-black/60 px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-admin-accent disabled:opacity-30"
            title={t("moveLater")}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleting}
            className={`px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50 ${
              confirmingDelete
                ? "bg-admin-error text-white"
                : "bg-black/60 text-white hover:bg-admin-error"
            }`}
          >
            {deleting
              ? t("deleting")
              : confirmingDelete
                ? t("confirmDelete")
                : t("delete")}
          </button>
          {confirmingDelete && !deleting && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="bg-black/60 px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-white/20"
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>
      <form action={formAction} className="flex items-center gap-1 p-2">
        <input
          type="text"
          name="caption"
          defaultValue={slide.caption ?? ""}
          placeholder={t("captionPlaceholder")}
          className="w-full border border-admin-border px-2 py-1 text-xs focus:border-admin-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 border border-admin-border px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider text-admin-ink uppercase transition-colors hover:bg-admin-accent hover:text-admin-accent-ink disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </form>
      {state.error && (
        <p className="px-2 pb-2 text-xs text-admin-error" role="alert">
          {state.error}
        </p>
      )}
      {deleteError && (
        <p className="px-2 pb-2 text-xs text-admin-error" role="alert">
          {deleteError}
        </p>
      )}
    </div>
  );
}

export function HeroSlidesGrid({ slides }: { slides: HeroSlideRow[] }) {
  const t = useTranslations("AdminHero");

  if (slides.length === 0) {
    return (
      <p className="border border-dashed border-admin-border p-8 text-center text-sm text-admin-muted">
        {t("emptyState")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {slides.map((slide, i) => (
        <HeroSlideCard
          key={slide.id}
          slide={slide}
          isFirst={i === 0}
          isLast={i === slides.length - 1}
        />
      ))}
    </div>
  );
}
