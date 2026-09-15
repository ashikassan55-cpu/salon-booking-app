"use client";

import { AvatarPlaceholder } from "@/components/ui/placeholder-image";

export type EligibleStylist = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  price: number;
};

const ANY_PROFESSIONAL = "any";

export function StylistPicker({
  stylists,
  cheapestPrice,
  selectedStaffId,
  onSelect,
}: {
  stylists: EligibleStylist[];
  cheapestPrice: number | null;
  selectedStaffId: string;
  onSelect: (staffId: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect(ANY_PROFESSIONAL)}
        className={`flex items-center gap-3 border p-3 text-left transition-colors ${
          selectedStaffId === ANY_PROFESSIONAL
            ? "border-foreground-dark bg-foreground-dark/10"
            : "border-border-dark hover:bg-foreground-dark/5"
        }`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-dark text-lg">
          ✨
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Any Professional</p>
          <p className="truncate text-xs text-muted-dark">
            Maximum availability
            {cheapestPrice !== null ? ` · from $${cheapestPrice}` : ""}
          </p>
        </div>
      </button>

      {stylists.map((stylist) => (
        <button
          key={stylist.id}
          type="button"
          onClick={() => onSelect(stylist.id)}
          className={`flex items-center gap-3 border p-3 text-left transition-colors ${
            selectedStaffId === stylist.id
              ? "border-foreground-dark bg-foreground-dark/10"
              : "border-border-dark hover:bg-foreground-dark/5"
          }`}
        >
          {stylist.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
            <img
              src={stylist.photoUrl}
              alt={stylist.name}
              className="h-12 w-12 shrink-0 rounded-full border border-border-dark object-cover"
            />
          ) : (
            <AvatarPlaceholder
              name={stylist.name}
              className="h-12 w-12 shrink-0 text-sm"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{stylist.name}</p>
            <p className="truncate text-xs text-muted-dark">{stylist.role}</p>
            <p className="text-xs text-muted-dark">
              {stylist.reviewCount > 0 && stylist.avgRating !== null
                ? `★ ${stylist.avgRating.toFixed(1)} · `
                : ""}
              ${stylist.price}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
