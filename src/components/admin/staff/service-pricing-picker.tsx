"use client";

import type { Service, StaffServicePricing } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

/**
 * Checkbox list of every service; checking one means this stylist performs
 * it. An optional custom price overrides the base service price just for
 * this stylist — left blank, the base price applies.
 */
export function ServicePricingPicker({
  services,
  value,
  onChange,
}: {
  services: Service[];
  value: StaffServicePricing[];
  onChange: (updated: StaffServicePricing[]) => void;
}) {
  function priceFor(serviceId: string) {
    return value.find((v) => v.serviceId === serviceId)?.customPrice ?? null;
  }

  function toggle(serviceId: string, checked: boolean) {
    if (checked) {
      onChange([...value, { serviceId, customPrice: null }]);
    } else {
      onChange(value.filter((v) => v.serviceId !== serviceId));
    }
  }

  function setPrice(serviceId: string, raw: string) {
    const customPrice = raw.trim() === "" ? null : Number(raw);
    onChange(
      value.map((v) => (v.serviceId === serviceId ? { ...v, customPrice } : v)),
    );
  }

  if (services.length === 0) {
    return (
      <p className="text-xs text-admin-muted">
        No services exist yet — add one under Services first.
      </p>
    );
  }

  return (
    <div className="divide-y divide-admin-border">
      {services.map((service) => {
        const checked = value.some((v) => v.serviceId === service.id);
        const price = priceFor(service.id);
        return (
          <div
            key={service.id}
            className="flex flex-wrap items-center gap-3 py-2.5"
          >
            <label className="flex min-w-[160px] flex-1 items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(service.id, e.target.checked)}
                className="h-4 w-4 accent-admin-accent"
              />
              <span className="font-admin-display font-bold tracking-wide text-admin-ink uppercase">
                {service.name}
              </span>
              <span className="text-admin-muted">
                (base {formatCurrency(service.price, false)})
              </span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-admin-muted">AED</span>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!checked}
                placeholder={`${service.price}`}
                value={price ?? ""}
                onChange={(e) => setPrice(service.id, e.target.value)}
                className="w-24 border border-admin-border bg-admin-bg px-2 py-1 text-xs tabular-nums disabled:opacity-40"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
