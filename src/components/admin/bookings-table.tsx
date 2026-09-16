import { getTranslations } from "next-intl/server";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatInSalonTimezone } from "@/lib/timezone";
import { normalizeUaePhoneForWhatsapp } from "@/lib/phone";
import { formatCurrency } from "@/lib/currency";
import { BookingStatusActions } from "./booking-status-actions";

const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export type BookingFilters = {
  status?: string;
  date?: string;
};

function formatDate(isoString: string) {
  return formatInSalonTimezone(new Date(isoString), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusPill({
  status,
  label,
}: {
  status: BookingStatus;
  label: string;
}) {
  const isFilled = status === "confirmed" || status === "completed";
  const isCancelled = status === "cancelled";

  return (
    <span
      className={`inline-block border px-2 py-0.5 font-admin-display text-[10px] font-bold tracking-wider uppercase ${
        isFilled
          ? "border-admin-accent bg-admin-accent text-admin-accent-ink"
          : isCancelled
            ? "border-admin-border text-admin-muted line-through"
            : "border-admin-border text-admin-ink"
      }`}
    >
      {label}
    </span>
  );
}

function reviewRequestUrl({
  booking,
  salonName,
  siteUrl,
  t,
}: {
  booking: Booking;
  salonName: string;
  siteUrl: string;
  t: Awaited<ReturnType<typeof getTranslations<"AdminBookings">>>;
}) {
  const message = t("reviewMessage", {
    name: booking.customer_name,
    salonName,
    service: booking.service_name_snapshot,
    stylist: booking.staff_name_snapshot ?? t("ourTeam"),
    url: `${siteUrl}/rate/${booking.review_token}`,
  });
  const phone = normalizeUaePhoneForWhatsapp(booking.customer_phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function ReviewCell({
  booking,
  salonName,
  siteUrl,
  t,
}: {
  booking: Booking;
  salonName: string;
  siteUrl: string;
  t: Awaited<ReturnType<typeof getTranslations<"AdminBookings">>>;
}) {
  if (booking.status !== "completed") {
    return <span className="text-xs text-admin-muted">—</span>;
  }

  if (booking.reviewed_at) {
    return (
      <span className="inline-block border border-admin-accent bg-admin-accent px-2 py-0.5 font-admin-display text-[10px] font-bold tracking-wider text-admin-accent-ink uppercase">
        {t("reviewed")}
      </span>
    );
  }

  return (
    <a
      href={reviewRequestUrl({ booking, salonName, siteUrl, t })}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block border border-admin-border px-3 py-1 font-admin-display text-[11px] font-bold tracking-wider uppercase transition-colors hover:bg-admin-accent hover:text-admin-accent-ink"
    >
      {t("sendReview")}
    </a>
  );
}

export async function BookingsTable({
  bookings,
  filters,
  salonName,
  siteUrl,
}: {
  bookings: Booking[];
  filters: BookingFilters;
  salonName: string;
  siteUrl: string;
}) {
  const t = await getTranslations("AdminBookings");

  return (
    <div>
      <form className="flex flex-wrap items-end gap-4" method="get">
        <div>
          <label
            htmlFor="status"
            className="block font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
          >
            {t("filters.status")}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 border border-admin-border bg-admin-surface px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
          >
            <option value="">{t("filters.all")}</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
          >
            {t("filters.date")}
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={filters.date ?? ""}
            className="mt-1 border border-admin-border bg-admin-surface px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-admin-accent px-4 py-2 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase"
        >
          {t("filters.filter")}
        </button>
        {(filters.status || filters.date) && (
          <a
            href="/admin"
            className="text-xs text-admin-muted underline underline-offset-2"
          >
            {t("filters.clear")}
          </a>
        )}
      </form>

      <div className="mt-6 border border-admin-border bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border px-4 py-2">
          <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-ink uppercase">
            {t("tableHeading")}
          </p>
          <span className="border border-admin-border px-2 py-0.5 font-admin-display text-[10px] font-bold tracking-wider text-admin-muted uppercase">
            {t("showingCount", { count: bookings.length })}
          </span>
        </div>

        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <p className="p-8 text-sm text-admin-muted">{t("noMatch")}</p>
          ) : (
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-admin-accent bg-admin-bg text-start font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                  <th className="px-4 py-3">{t("columns.customer")}</th>
                  <th className="px-4 py-3">{t("columns.service")}</th>
                  <th className="px-4 py-3">{t("columns.stylist")}</th>
                  <th className="px-4 py-3">{t("columns.dateTime")}</th>
                  <th className="px-4 py-3">{t("columns.status")}</th>
                  <th className="px-4 py-3">{t("columns.review")}</th>
                  <th className="px-4 py-3">{t("columns.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-admin-row-hover"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-admin-border font-admin-display text-[10px] font-bold text-admin-ink">
                          {initials(booking.customer_name)}
                        </span>
                        <div>
                          <p className="font-medium">
                            {booking.customer_name}
                          </p>
                          <p className="text-xs text-admin-muted">
                            {booking.customer_phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p>{booking.service_name_snapshot}</p>
                      <p className="text-xs text-admin-muted tabular-nums">
                        {formatCurrency(booking.service_price_snapshot, false)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {booking.staff_name_snapshot ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums">
                      {formatDate(booking.service_date)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusPill
                        status={booking.status}
                        label={t(`status.${booking.status}`)}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ReviewCell
                        booking={booking}
                        salonName={salonName}
                        siteUrl={siteUrl}
                        t={t}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <BookingStatusActions booking={booking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
