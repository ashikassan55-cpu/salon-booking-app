"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validation/service";

export type ServiceFormState = { error: string | null };

async function uploadServiceImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const path = `services/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Image upload failed — please try again." };
  }

  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function createService(
  formData: FormData,
): Promise<ServiceFormState> {
  const result = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    duration_minutes: formData.get("duration_minutes"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();

  let imageUrl: string | undefined;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadServiceImage(supabase, imageFile);
    if (uploaded.error) return { error: uploaded.error };
    imageUrl = uploaded.url;
  }

  const { error } = await supabase.from("services").insert({
    name: result.data.name,
    description: result.data.description || null,
    price: result.data.price,
    duration_minutes: result.data.duration_minutes,
    image_url: imageUrl ?? null,
  });

  if (error) {
    return { error: "Couldn't create the service — please try again." };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { error: null };
}

export async function updateService(
  id: string,
  formData: FormData,
): Promise<ServiceFormState> {
  const result = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    duration_minutes: formData.get("duration_minutes"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();

  let imageUrl: string | undefined;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadServiceImage(supabase, imageFile);
    if (uploaded.error) return { error: uploaded.error };
    imageUrl = uploaded.url;
  }

  const { error } = await supabase
    .from("services")
    .update({
      name: result.data.name,
      description: result.data.description || null,
      price: result.data.price,
      duration_minutes: result.data.duration_minutes,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", id);

  if (error) {
    return { error: "Couldn't save the service — please try again." };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { error: null };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/");
}
