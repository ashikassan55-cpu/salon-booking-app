"use client";

import { useState } from "react";
import type { StaffReview, StaffServiceOffering, TeamMember } from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/placeholder-image";

type Tab = "profile" | "services" | "reviews";

/** Deterministic per-stylist filler for metrics we have no real schema for
 * (appointments/clients served) — same stylist always shows the same
 * numbers rather than re-rolling randomly on every page load. */
function seededInt(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {"★".repeat(Math.round(rating))}
      <span className="text-gray-300">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

export function StaffProfileModal({
  member,
  offerings,
  reviews,
  onClose,
}: {
  member: TeamMember;
  offerings: StaffServiceOffering[];
  reviews: StaffReview[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("profile");

  const appointmentsCompleted = seededInt(member.id, 800, 6000);
  const clientsServed = seededInt(member.id, 200, 1800);
  const languages = ["English", "Arabic"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl">
        <div className="relative bg-gray-50 px-6 pt-10 pb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          >
            ✕
          </button>

          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
            <img
              src={member.photoUrl}
              alt={member.name}
              className="mx-auto h-32 w-32 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <AvatarPlaceholder name={member.name} className="mx-auto h-32 w-32" />
          )}

          <p className="mt-4 text-center text-2xl font-bold">{member.name}</p>
          <p className="text-center text-gray-500">{member.role}</p>
          <p className="mt-1 text-center text-sm text-gray-500">
            {member.reviewCount > 0 && member.avgRating !== null ? (
              <>
                <span className="text-yellow-500">★</span>{" "}
                <span className="font-semibold text-gray-900">
                  {member.avgRating.toFixed(1)}
                </span>{" "}
                ({member.reviewCount})
              </>
            ) : (
              "No reviews yet"
            )}
          </p>
          <p className="mt-1 text-center text-sm text-gray-400">Dubai</p>
        </div>

        <div className="flex items-center justify-center gap-2 border-b border-gray-200 px-4 py-3">
          {(
            [
              { key: "profile", label: "Profile" },
              { key: "services", label: "Services" },
              { key: "reviews", label: "Reviews", count: member.reviewCount },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-black text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.label}
              {"count" in t && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    tab === t.key ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === "profile" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Appointments completed
                  </span>
                  <span className="tabular-nums text-gray-500">
                    {appointmentsCompleted.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Clients served
                  </span>
                  <span className="tabular-nums text-gray-500">
                    {clientsServed.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-900">Languages</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "services" && (
            <div className="space-y-1">
              {offerings.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No services listed yet.
                </p>
              ) : (
                offerings.map((offering) => (
                  <div
                    key={offering.serviceId}
                    className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                  >
                    <span className="font-medium text-gray-900">
                      {offering.name}
                    </span>
                    <span className="tabular-nums text-gray-500">
                      ${offering.price}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-700">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <a
            href="#booking"
            onClick={onClose}
            className="block w-full rounded-full bg-black py-3.5 text-center font-semibold text-white transition-opacity hover:opacity-90"
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  );
}
