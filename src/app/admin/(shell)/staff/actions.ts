"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createStaffSchema } from "@/lib/validation/staff";
import { staffServicePricingListSchema } from "@/lib/validation/staff-service";

export type StaffFormState = { error: string | null };

async function uploadStaffPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  t: Awaited<ReturnType<typeof getTranslations<"AdminStaff">>>,
): Promise<{ url?: string; error?: string }> {
  // Staff headshots reuse the existing 'gallery' bucket under a staff/
  // prefix — same convention services/actions.ts already uses for its own
  // services/ prefix, so no new bucket or storage policies are needed.
  const path = `staff/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: t("photoUploadError") };
  }

  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return { url: data.publicUrl };
}

function parsePricing(formData: FormData) {
  const raw = formData.get("pricing");
  let parsed: unknown;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : [];
  } catch {
    return null;
  }
  return staffServicePricingListSchema.safeParse(parsed);
}

/** Replaces all of a stylist's service/price rows in one go — simpler and
 * safer than diffing, since the whole pricing picker is always resubmitted
 * as one unit (same "one save, one call" pattern as updateSiteSettings). */
async function replaceStaffServices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffId: string,
  pricing: { serviceId: string; customPrice?: number | null }[],
) {
  await supabase.from("staff_services").delete().eq("staff_id", staffId);
  if (pricing.length === 0) return null;

  const { error } = await supabase.from("staff_services").insert(
    pricing.map((p) => ({
      staff_id: staffId,
      service_id: p.serviceId,
      custom_price: p.customPrice ?? null,
    })),
  );
  return error;
}

export async function createStaff(formData: FormData): Promise<StaffFormState> {
  const t = await getTranslations("AdminStaff");
  const tValidation = await getTranslations("Validation");
  const staffSchema = createStaffSchema(tValidation);

  const scheduleRaw = formData.get("schedule");
  let schedule: unknown;
  try {
    schedule = typeof scheduleRaw === "string" ? JSON.parse(scheduleRaw) : [];
  } catch {
    return { error: t("scheduleMalformed") };
  }

  const result = staffSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    schedule,
    bio: formData.get("bio") || undefined,
    suiteLabel: formData.get("suiteLabel") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? t("checkForm") };
  }

  const pricingResult = parsePricing(formData);
  if (!pricingResult || !pricingResult.success) {
    return { error: t("pricingMalformed") };
  }

  const supabase = await createClient();

  let photoUrl: string | undefined;
  const photoFile = formData.get("photo");
  if (photoFile instanceof File && photoFile.size > 0) {
    const uploaded = await uploadStaffPhoto(supabase, photoFile, t);
    if (uploaded.error) return { error: uploaded.error };
    photoUrl = uploaded.url;
  }

  const { data: inserted, error } = await supabase
    .from("staff")
    .insert({
      name: result.data.name,
      role: result.data.role,
      schedule: result.data.schedule,
      photo_url: photoUrl ?? null,
      bio: result.data.bio || null,
      suite_label: result.data.suiteLabel || null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: t("createError") };
  }

  const pricingError = await replaceStaffServices(
    supabase,
    inserted.id,
    pricingResult.data,
  );
  if (pricingError) {
    return { error: t("pricingSaveError") };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/");
  return { error: null };
}

export async function updateStaff(
  id: string,
  formData: FormData,
): Promise<StaffFormState> {
  const t = await getTranslations("AdminStaff");
  const tValidation = await getTranslations("Validation");
  const staffSchema = createStaffSchema(tValidation);

  const scheduleRaw = formData.get("schedule");
  let schedule: unknown;
  try {
    schedule = typeof scheduleRaw === "string" ? JSON.parse(scheduleRaw) : [];
  } catch {
    return { error: t("scheduleMalformed") };
  }

  const result = staffSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    schedule,
    bio: formData.get("bio") || undefined,
    suiteLabel: formData.get("suiteLabel") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? t("checkForm") };
  }

  const pricingResult = parsePricing(formData);
  if (!pricingResult || !pricingResult.success) {
    return { error: t("pricingMalformed") };
  }

  const supabase = await createClient();

  let photoUrl: string | undefined;
  const photoFile = formData.get("photo");
  if (photoFile instanceof File && photoFile.size > 0) {
    const uploaded = await uploadStaffPhoto(supabase, photoFile, t);
    if (uploaded.error) return { error: uploaded.error };
    photoUrl = uploaded.url;
  }

  const { error } = await supabase
    .from("staff")
    .update({
      name: result.data.name,
      role: result.data.role,
      schedule: result.data.schedule,
      bio: result.data.bio || null,
      suite_label: result.data.suiteLabel || null,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .eq("id", id);

  if (error) {
    return { error: t("updateError") };
  }

  const pricingError = await replaceStaffServices(supabase, id, pricingResult.data);
  if (pricingError) {
    return { error: t("pricingSaveError") };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/");
  return { error: null };
}

/** The only supported removal path — hides a stylist from the public site
 * and booking flow without deleting their history. A hard delete isn't
 * exposed here at all: reviews.staff_id is ON DELETE RESTRICT, so a
 * reviewed stylist couldn't be hard-deleted anyway. */
export async function deactivateStaff(id: string) {
  const supabase = await createClient();
  await supabase.from("staff").update({ is_active: false }).eq("id", id);
  revalidatePath("/admin/staff");
  revalidatePath("/");
}

export async function reactivateStaff(id: string) {
  const supabase = await createClient();
  await supabase.from("staff").update({ is_active: true }).eq("id", id);
  revalidatePath("/admin/staff");
  revalidatePath("/");
}
