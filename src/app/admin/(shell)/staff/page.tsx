import { StaffManager } from "@/components/admin/staff/staff-manager";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import type { Staff, StaffServicePricing } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";

export default async function AdminStaffPage() {
  const supabase = await createClient();

  const [
    { data: staffRows, error: staffError },
    { data: staffServiceRows, error: staffServicesError },
    { data: services, error: servicesError },
    settings,
  ] = await Promise.all([
    supabase.from("staff").select("*").order("created_at", { ascending: true }),
    supabase.from("staff_services").select("*"),
    supabase.from("services").select("*").order("created_at", { ascending: true }),
    getSiteSettings(),
  ]);

  const error = staffError || staffServicesError || servicesError;
  if (error) {
    return (
      <p className="text-sm text-admin-error" role="alert">
        Couldn&apos;t load staff: {error.message}
      </p>
    );
  }

  const staff: Staff[] = (staffRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    photoUrl: row.photo_url,
    schedule: (row.schedule as WorkingHourEntry[]) ?? settings.workingHours,
    isActive: row.is_active,
  }));

  const pricingByStaffId: Record<string, StaffServicePricing[]> = {};
  for (const row of staffServiceRows ?? []) {
    const list = pricingByStaffId[row.staff_id] ?? [];
    list.push({ serviceId: row.service_id, customPrice: row.custom_price });
    pricingByStaffId[row.staff_id] = list;
  }

  return (
    <StaffManager
      staff={staff}
      pricingByStaffId={pricingByStaffId}
      services={services ?? []}
      defaultSchedule={settings.workingHours}
    />
  );
}
