import type { Service, StaffReview, TeamMember } from "@/lib/types";
import { teamStats } from "@/lib/mock-team";
import { TeamGrid } from "./team-carousel";

type StaffServicePricing = {
  staff_id: string;
  service_id: string;
  custom_price: number | null;
};

export function TeamSection({
  members,
  services,
  staffServices,
  reviews,
}: {
  members: TeamMember[];
  services: Service[];
  staffServices: StaffServicePricing[];
  reviews: StaffReview[];
}) {
  return (
    <section className="bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          Explore our team
        </p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          Skilled hands behind every appointment
        </h2>

        <div className="mt-10">
          <TeamGrid
            members={members}
            services={services}
            staffServices={staffServices}
            reviews={reviews}
          />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 sm:grid-cols-4">
          {teamStats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-3xl font-bold">{stat.value}</dd>
              <p className="mt-1 text-xs text-muted uppercase">{stat.label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
