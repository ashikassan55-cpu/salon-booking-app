"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UploadState = { error: string | null };

/**
 * Called directly from the client (not via <form action>), since the
 * uploader needs an async compression step before it has a file to send.
 */
export async function uploadGalleryImage(
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("file");
  const captionValue = formData.get("caption");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const supabase = await createClient();
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Upload failed — please try again." };
  }

  const { data: publicUrlData } = supabase.storage
    .from("gallery")
    .getPublicUrl(path);

  const caption =
    typeof captionValue === "string" && captionValue.trim()
      ? captionValue.trim()
      : null;

  const { error: insertError } = await supabase.from("gallery").insert({
    image_url: publicUrlData.publicUrl,
    caption,
  });

  if (insertError) {
    return { error: "Image uploaded but saving its record failed." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { error: null };
}

/**
 * We only store the public URL, not the raw storage path — this recovers
 * it, since we always generate these URLs ourselves via getPublicUrl().
 */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/object/public/gallery/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function deleteGalleryImage(id: string, imageUrl: string) {
  const supabase = await createClient();

  const path = storagePathFromPublicUrl(imageUrl);
  if (path) {
    await supabase.storage.from("gallery").remove([path]);
  }

  await supabase.from("gallery").delete().eq("id", id);

  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export type CaptionState = { error: string | null };

export async function updateGalleryCaption(
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
    .from("gallery")
    .update({ caption })
    .eq("id", id);

  if (error) {
    return { error: "Couldn't save the caption — please try again." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { error: null };
}
