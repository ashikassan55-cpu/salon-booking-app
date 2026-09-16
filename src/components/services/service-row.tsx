import { getTranslations } from "next-intl/server";
import type { Service } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

async function formatDuration(minutes: number) {
  const t = await getTranslations("PublicServices");
  if (minutes < 60) return t("durationMinutes", { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest
    ? t("durationHoursMinutes", { hours, minutes: rest })
    : t("durationHours", { hours });
}

export async function ServiceRow({ service }: { service: Service }) {
  const duration = await formatDuration(service.duration_minutes);
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border-dark py-6">
      <div>
        <p className="text-base font-semibold">{service.name}</p>
        <p className="mt-1 text-sm text-muted-dark">
          {service.description ?? duration}
        </p>
      </div>
      <p className="shrink-0 text-lg font-semibold text-muted-dark">
        {formatCurrency(service.price)}
      </p>
    </div>
  );
}
