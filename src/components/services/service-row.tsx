import type { Service } from "@/lib/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

export function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border-dark py-6">
      <div>
        <p className="text-base font-semibold">{service.name}</p>
        <p className="mt-1 text-sm text-muted-dark">
          {service.description ?? formatDuration(service.duration_minutes)}
        </p>
      </div>
      <p className="shrink-0 text-lg font-semibold text-muted-dark">
        {formatPrice(service.price)}
      </p>
    </div>
  );
}
