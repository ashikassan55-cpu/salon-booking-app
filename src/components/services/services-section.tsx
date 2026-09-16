import { getTranslations } from "next-intl/server";
import type { Service } from "@/lib/types";
import { ServiceList } from "./service-list";

export async function ServicesSection({ services }: { services: Service[] }) {
  const t = await getTranslations("PublicServices");
  return (
    <section
      id="services"
      className="bg-surface-dark px-6 py-16 text-foreground-dark"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-dark uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
        </h2>

        <div className="mt-10">
          <ServiceList services={services} />
        </div>
      </div>
    </section>
  );
}
