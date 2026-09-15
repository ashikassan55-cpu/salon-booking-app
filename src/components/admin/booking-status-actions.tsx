import type { Booking, BookingStatus } from "@/lib/types";
import { updateBookingStatus } from "@/app/admin/(shell)/actions";

const ACTIONS: { status: BookingStatus; label: string }[] = [
  { status: "confirmed", label: "Confirm" },
  { status: "completed", label: "Complete" },
  { status: "cancelled", label: "Cancel" },
];

export function BookingStatusActions({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ status, label }) => (
        <form key={status} action={updateBookingStatus.bind(null, booking.id, status)}>
          <button
            type="submit"
            disabled={booking.status === status}
            className="border border-admin-border px-3 py-1 font-admin-display text-[11px] font-bold tracking-wider uppercase transition-colors hover:bg-admin-accent hover:text-admin-accent-ink disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-admin-ink"
          >
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}
