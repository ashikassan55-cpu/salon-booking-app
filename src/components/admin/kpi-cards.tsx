import { getTranslations } from "next-intl/server";
import type { BookingKpis } from "@/lib/admin/analytics";
import type { BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5c0-1 1-2 2.5-2s2.5.8 2.5 1.8c0 2.4-5 1.4-5 3.9 0 1 1 1.8 2.5 1.8s2.5-1 2.5-2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function PieIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function CardShell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-admin-border bg-admin-surface p-5">
      <div className="flex items-start justify-between">
        <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
          {label}
        </p>
        <span className="text-admin-muted">{icon}</span>
      </div>
      {children}
    </div>
  );
}

export async function KpiCards({ kpis }: { kpis: BookingKpis }) {
  const t = await getTranslations("AdminBookings");
  const totalForBreakdown = Object.values(kpis.statusBreakdown).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardShell icon={<CalendarIcon />} label={t("kpi.bookingsToday")}>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {kpis.totalToday}
          </p>
        </CardShell>
        <CardShell icon={<CalendarIcon />} label={t("kpi.bookingsThisWeek")}>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {kpis.totalThisWeek}
          </p>
        </CardShell>
        <CardShell icon={<CalendarIcon />} label={t("kpi.bookingsThisMonth")}>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {kpis.totalThisMonth}
          </p>
        </CardShell>
        <CardShell icon={<RevenueIcon />} label={t("kpi.estimatedRevenue")}>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {formatCurrency(kpis.estimatedRevenue)}
          </p>
          <p className="mt-1 text-xs text-admin-muted">
            {kpis.averageTicket > 0
              ? t("kpi.avgTicket", { price: formatCurrency(kpis.averageTicket) })
              : t("kpi.confirmedCompletedOnly")}
          </p>
        </CardShell>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CardShell icon={<ListIcon />} label={t("kpi.popularServices")}>
          {kpis.popularServices.length === 0 ? (
            <p className="mt-3 text-sm text-admin-muted">
              {t("kpi.noBookingsYet")}
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {kpis.popularServices.map((service, i) => (
                <li
                  key={service.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {i + 1}. {service.name}
                  </span>
                  <span className="font-medium tabular-nums text-admin-muted">
                    {service.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardShell>

        <CardShell icon={<PieIcon />} label={t("kpi.statusBreakdown")}>
          <ul className="mt-3 space-y-2">
            {Object.entries(kpis.statusBreakdown).map(([status, count]) => (
              <li
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <span>{t(`status.${status as BookingStatus}`)}</span>
                <span className="font-medium tabular-nums text-admin-muted">
                  {count}
                </span>
              </li>
            ))}
          </ul>
          {totalForBreakdown > 0 && (
            <div className="mt-4 flex h-1.5 w-full overflow-hidden bg-admin-bg">
              {(Object.keys(kpis.statusBreakdown) as BookingStatus[]).map(
                (status) => {
                  const count = kpis.statusBreakdown[status];
                  if (count === 0) return null;
                  const width = (count / totalForBreakdown) * 100;
                  return (
                    <div
                      key={status}
                      title={`${t(`status.${status}`)}: ${count}`}
                      className={
                        status === "cancelled"
                          ? "bg-admin-border"
                          : "bg-admin-accent"
                      }
                      style={{
                        width: `${width}%`,
                        opacity:
                          status === "confirmed" || status === "completed"
                            ? 1
                            : status === "pending"
                              ? 0.5
                              : 1,
                      }}
                    />
                  );
                },
              )}
            </div>
          )}
        </CardShell>
      </div>
    </div>
  );
}
