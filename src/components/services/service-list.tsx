import { getTranslations } from "next-intl/server";
import type { Service } from "@/lib/types";
import { ServiceRow } from "./service-row";

function splitInHalf<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export async function ServiceList({ services }: { services: Service[] }) {
  const t = await getTranslations("PublicServices");

  if (services.length === 0) {
    return <p className="text-sm text-muted-dark">{t("empty")}</p>;
  }

  const [left, right] = splitInHalf(services);

  return (
    <div className="grid gap-x-16 sm:grid-cols-2">
      <div>
        {left.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>
      <div>
        {right.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
