import { getTranslations } from "next-intl/server";
import { KpiCards } from "@/components/admin/kpi-cards";
import { BookingsTable } from "@/components/admin/bookings-table";
import { computeBookingKpis } from "@/lib/admin/analytics";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { salonDayRangeUtc } from "@/lib/timezone";

type AdminPageProps = {
  searchParams: Promise<{ status?: string; date?: string }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminPageProps) {
  const filters = await searchParams;
  const supabase = await createClient();
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const t = await getTranslations("AdminBookings");

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("service_date", { ascending: false });

  const allBookings = bookings ?? [];
  const kpis = computeBookingKpis(allBookings);

  const filteredBookings = allBookings.filter((booking) => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.date) {
      const [start, end] = salonDayRangeUtc(filters.date);
      const serviceDate = new Date(booking.service_date);
      if (serviceDate < start || serviceDate >= end) return false;
    }
    return true;
  });

  return (
    <div>
      <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mt-1 font-admin-display text-4xl font-bold tracking-tight text-admin-ink uppercase">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-admin-muted">
        {t("subtitle")}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-admin-error" role="alert">
          {t("loadError", { message: error.message })}
        </p>
      ) : (
        <>
          <div className="mt-8">
            <KpiCards kpis={kpis} />
          </div>

          <div className="mt-10">
            <h2 className="font-admin-display text-lg font-bold tracking-wide text-admin-ink uppercase">
              {t("tableHeading")}
            </h2>
            <div className="mt-4">
              <BookingsTable
                bookings={filteredBookings}
                filters={filters}
                salonName={settings.name}
                siteUrl={siteUrl}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
