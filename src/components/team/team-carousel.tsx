"use client";

import { useMemo, useState } from "react";
import type {
  Service,
  StaffReview,
  StaffServiceOffering,
  TeamMember,
} from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/placeholder-image";
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
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-14">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setSelected(member)}
            className="flex w-32 flex-col items-center text-center sm:w-36"
          >
            <div className="relative">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-28 w-28 rounded-full border border-border object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <AvatarPlaceholder
                  name={member.name}
                  className="h-28 w-28 sm:h-32 sm:w-32"
                />
              )}
              {member.reviewCount > 0 && member.avgRating !== null && (
                <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-sm">
                  <span className="text-yellow-500">★</span>
                  {member.avgRating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="mt-4 font-semibold">{member.name}</p>
            <p className="text-sm text-muted">{member.role}</p>
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
