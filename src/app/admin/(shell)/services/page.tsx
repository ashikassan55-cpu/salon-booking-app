import { getTranslations } from "next-intl/server";
import { ServicesManager } from "@/components/admin/services/services-manager";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    const t = await getTranslations("AdminServices");
    return (
      <p className="text-sm text-admin-error" role="alert">
        {t("loadError", { message: error.message })}
      </p>
    );
  }

  return <ServicesManager services={services ?? []} />;
}
