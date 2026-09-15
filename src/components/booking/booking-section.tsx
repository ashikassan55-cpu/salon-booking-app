import type { BookingStylist, Service } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";
import { BookingForm } from "./booking-form";

type StaffServicePricing = {
  staff_id: string;
  service_id: string;
  custom_price: number | null;
};

export function BookingSection({
  services,
  staff,
  staffServices,
  workingHours,
}: {
  services: Service[];
  staff: BookingStylist[];
  staffServices: StaffServicePricing[];
  workingHours: WorkingHourEntry[];
}) {
  return (
    <section
      id="booking"
      className="border-t border-border-dark bg-surface-dark px-6 py-24 text-foreground-dark"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-dark uppercase">
          Reserve your spot
        </p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          Choose your perfect service
        </h2>

        <div className="mt-14">
          <BookingForm
            services={services}
            staff={staff}
            staffServices={staffServices}
            workingHours={workingHours}
          />
        </div>
      </div>
    </section>
  );
}
