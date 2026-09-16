"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  Service,
  StaffReview,
  StaffServiceOffering,
  TeamMember,
} from "@/lib/types";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { StaffProfileModal } from "./staff-profile-modal";

type StaffServicePricing = {
  staff_id: string;
  service_id: string;
  custom_price: number | null;
};

export function TeamGrid({
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
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const t = useTranslations("PublicTeam");

  const offerings: StaffServiceOffering[] = useMemo(() => {
    if (!selected) return [];
    return staffServices
      .filter((ss) => ss.staff_id === selected.id)
      .map((ss) => {
        const service = services.find((s) => s.id === ss.service_id);
        if (!service) return null;
        const offering: StaffServiceOffering = {
          serviceId: service.id,
          name: service.name,
          price: ss.custom_price ?? service.price,
        };
        return offering;
      })
      .filter((o): o is StaffServiceOffering => o !== null);
  }, [selected, services, staffServices]);

  const reviewsForSelected = useMemo(
    () => (selected ? reviews.filter((r) => r.staffId === selected.id) : []),
    [selected, reviews],
  );

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setSelected(member)}
            className="flex h-full w-60 flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 text-start transition-colors hover:border-white/25 sm:w-64"
          >
            <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PlaceholderImage label={member.name} className="h-full w-full" />
              )}
              {member.reviewCount > 0 && member.avgRating !== null && (
                <span className="absolute top-3 start-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white">
                  <span className="text-yellow-400">★</span>
                  {member.avgRating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                {member.role}
              </p>
              <p className="mt-1 text-lg font-bold text-white">{member.name}</p>
              {member.bio && (
                <p className="mt-2 text-sm text-neutral-400">{member.bio}</p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                {member.suiteLabel ? (
                  <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                    {member.suiteLabel}
                  </span>
                ) : (
                  <span />
                )}
                <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold tracking-wide text-black uppercase">
                  {t("bookSuiteButton")}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <StaffProfileModal
          member={selected}
          offerings={offerings}
          reviews={reviewsForSelected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
