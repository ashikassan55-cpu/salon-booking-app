import { ServicesManager } from "@/components/admin/services/services-manager";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-admin-error" role="alert">
        Couldn&apos;t load services: {error.message}
      </p>
    );
  }

  return <ServicesManager services={services ?? []} />;
}
