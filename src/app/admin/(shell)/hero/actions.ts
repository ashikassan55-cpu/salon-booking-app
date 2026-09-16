"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export type UploadState = { error: string | null };

/**
 * Called directly from the client (not via <form action>), since the
 * uploader needs an async compression step before it has a file to send —
 * same pattern as uploadGalleryImage.
 */
export async function uploadHeroSlide(formData: FormData): Promise<UploadState> {
  const t = await getTranslations("AdminHero.uploader");

  const file = formData.get("file");
  const captionValue = formData.get("caption");

  if (!(file instanceof File) || file.size === 0) {
    return { error: t("chooseImageError") };
  }

  const supabase = await createClient();

  // Hero images reuse the existing 'gallery' storage bucket under a hero/
  // prefix — same convention as services/ and staff/, no new bucket needed.
  const path = `hero/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: t("uploadError") };
  }

  const { data: publicUrlData } = supabase.storage
    .from("gallery")
    .getPublicUrl(path);

  const caption =
    typeof captionValue === "string" && captionValue.trim()
      ? captionValue.trim()
      : null;

  const { data: lastSlide } = await supabase
    .from("hero_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (lastSlide?.sort_order ?? -1) + 1;

  const { error: insertError } = await supabase.from("hero_slides").insert({
    image_url: publicUrlData.publicUrl,
    caption,
    sort_order: nextSortOrder,
  });

  if (insertError) {
    return { error: t("saveRecordError") };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  return { error: null };
}

/** We only store the public URL, not the raw storage path — this recovers
 * it, since we always generate these URLs ourselves via getPublicUrl(). */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/object/public/gallery/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export type DeleteState = { error: string | null };

export async function deleteHeroSlide(
  id: string,
  imageUrl: string,
): Promise<DeleteState> {
  const supabase = await createClient();

  // Storage cleanup is best-effort and non-fatal: an already-missing or
  // unrecognized-path file shouldn't block removing the DB row, which is
  // the part the admin actually sees and cares about.
  const path = storagePathFromPublicUrl(imageUrl);
  if (path) {
    await supabase.storage.from("gallery").remove([path]);
  }

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) {
    const t = await getTranslations("AdminHero");
    return { error: t("deleteError") };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  return { error: null };
}

export type CaptionState = { error: string | null };

export async function updateHeroSlideCaption(
  id: string,
  _prevState: CaptionState,
  formData: FormData,
): Promise<CaptionState> {
  const captionValue = formData.get("caption");
  const caption =
    typeof captionValue === "string" && captionValue.trim()
      ? captionValue.trim()
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ caption })
    .eq("id", id);

  if (error) {
    const t = await getTranslations("AdminHero");
    return { error: t("captionSaveError") };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  return { error: null };
}

/** Swaps this slide's sort_order with its neighbor in the given direction —
 * a no-op at either end of the list. */
export async function moveHeroSlide(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!slides) return;

  const index = slides.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= slides.length) return;

  const current = slides[index];
  const neighbor = slides[swapIndex];

  await supabase
    .from("hero_slides")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id);
  await supabase
    .from("hero_slides")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}
