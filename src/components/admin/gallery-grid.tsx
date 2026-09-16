"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { GalleryItem } from "@/lib/types";
import {
  deleteGalleryImage,
  updateGalleryCaption,
  type CaptionState,
} from "@/app/admin/(shell)/gallery/actions";

const initialCaptionState: CaptionState = { error: null };

function GalleryCard({ item }: { item: GalleryItem }) {
  const router = useRouter();
  const t = useTranslations("AdminGallery.card");
  const updateCaptionForItem = updateGalleryCaption.bind(null, item.id);
  const [state, formAction, pending] = useActionState(
    updateCaptionForItem,
    initialCaptionState,
  );
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!item.image_url) return;
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    await deleteGalleryImage(item.id, item.image_url);
    router.refresh();
  }

  return (
    <div className="border border-admin-border bg-admin-surface">
      <div className="relative aspect-square">
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, not a build-time asset
          <img
            src={item.image_url}
            alt={item.caption ?? ""}
            className="h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 end-2 bg-black/60 px-2 py-1 font-admin-display text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-admin-error disabled:opacity-50"
        >
          {deleting ? t("deleting") : t("delete")}
        </button>
      </div>
      <form action={formAction} className="flex items-center gap-1 p-2">
        <input
          type="text"
          name="caption"
          defaultValue={item.caption ?? ""}
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
    </div>
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("AdminGallery");

  if (items.length === 0) {
    return (
      <p className="border border-dashed border-admin-border p-8 text-center text-sm text-admin-muted">
        {t("emptyState")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
