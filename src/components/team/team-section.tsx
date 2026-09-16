import { getTranslations } from "next-intl/server";
import type { Service, StaffReview, TeamMember } from "@/lib/types";
import { teamStatValues } from "@/lib/mock-team";
import { TeamGrid } from "./team-carousel";

type StaffServicePricing = {
  staff_id: string;
  service_id: string;
  custom_price: number | null;
};

const STAT_KEYS = [
  "yearsExperience",
  "awardsWon",
  "servicesOffered",
  "happyClients",
] as const;

export async function TeamSection({
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
  const t = await getTranslations("PublicTeam");

  return (
    <section className="bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
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
          {STAT_KEYS.map((key) => (
            <div key={key}>
              <dt className="sr-only">{t(`stats.${key}`)}</dt>
              <dd className="text-3xl font-bold">{teamStatValues[key]}</dd>
              <p className="mt-1 text-xs text-muted uppercase">
                {t(`stats.${key}`)}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
