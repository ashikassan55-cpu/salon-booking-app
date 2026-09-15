"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validation/site-settings";

export type SettingsFormState = { error: string | null };

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const workingHoursRaw = formData.get("workingHours");
  let workingHours: unknown;
  try {
    workingHours =
      typeof workingHoursRaw === "string" ? JSON.parse(workingHoursRaw) : [];
  } catch {
    return { error: "Working hours data is malformed — please try again." };
  }

  const result = siteSettingsSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsappNumber: formData.get("whatsappNumber"),
    address: formData.get("address"),
    instagramUrl: formData.get("instagramUrl") || "",
    facebookUrl: formData.get("facebookUrl") || "",
    accentColor: formData.get("accentColor"),
    workingHours,
    googleReviewUrl: formData.get("googleReviewUrl") || "",
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    name: result.data.name,
    tagline: result.data.tagline,
    contact_email: result.data.email,
    contact_phone: result.data.phone,
    whatsapp_number: result.data.whatsappNumber,
    address: result.data.address,
    instagram_url: result.data.instagramUrl || null,
    facebook_url: result.data.facebookUrl || null,
    accent_color: result.data.accentColor,
    working_hours: result.data.workingHours,
    google_review_url: result.data.googleReviewUrl || null,
    // DEFAULT now() only fires on INSERT, not UPDATE — set it explicitly
    // so this stays a true "last edited" timestamp.
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", existing.id)
    : await supabase.from("site_settings").insert(payload);

  if (error) {
    return { error: "Couldn't save settings — please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { error: null };
}
