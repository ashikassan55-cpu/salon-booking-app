import type { Booking, BookingStatus } from "@/lib/types";
import {
  startOfNextSalonMonth,
  startOfSalonDay,
  startOfSalonMonth,
  startOfSalonWeek,
} from "@/lib/timezone";

const REVENUE_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "confirmed",
  "completed",
]);

export type PopularService = { name: string; count: number };

export type BookingKpis = {
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  estimatedRevenue: number;
  averageTicket: number;
  popularServices: PopularService[];
  statusBreakdown: Record<BookingStatus, number>;
};

/**
 * "Today/This Week/This Month" are counted by appointment date
 * (service_date), not when the booking was made — that's what an owner
 * checking the dashboard actually wants ("how many people are coming in").
 */
export function computeBookingKpis(
  bookings: Booking[],
  now: Date = new Date(),
): BookingKpis {
  const todayStart = startOfSalonDay(now);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekStart = startOfSalonWeek(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthStart = startOfSalonMonth(now);
  const monthEnd = startOfNextSalonMonth(now);

  let totalToday = 0;
  let totalThisWeek = 0;
  let totalThisMonth = 0;
  let estimatedRevenue = 0;
  let revenueBookingCount = 0;

  const serviceCounts = new Map<string, number>();
  const statusBreakdown: Record<BookingStatus, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const booking of bookings) {
    const serviceDate = new Date(booking.service_date);

    if (serviceDate >= todayStart && serviceDate < todayEnd) totalToday++;
    if (serviceDate >= weekStart && serviceDate < weekEnd) totalThisWeek++;
    if (serviceDate >= monthStart && serviceDate < monthEnd) totalThisMonth++;

    if (REVENUE_STATUSES.has(booking.status)) {
      estimatedRevenue += booking.service_price_snapshot;
      revenueBookingCount++;
    }

    statusBreakdown[booking.status]++;
    serviceCounts.set(
      booking.service_name_snapshot,
      (serviceCounts.get(booking.service_name_snapshot) ?? 0) + 1,
    );
  }

  const popularServices = [...serviceCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalToday,
    totalThisWeek,
    totalThisMonth,
    estimatedRevenue,
    averageTicket:
      revenueBookingCount > 0 ? estimatedRevenue / revenueBookingCount : 0,
    popularServices,
    statusBreakdown,
  };
}
