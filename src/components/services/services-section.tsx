import type { Service } from "@/lib/types";
import { ServiceList } from "./service-list";

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section
      id="services"
      className="bg-surface-dark px-6 py-16 text-foreground-dark"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-dark uppercase">
          Choose your best
        </p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          Explore our services
        </h2>

        <div className="mt-10">
          <ServiceList services={services} />
        </div>
      </div>
    </section>
  );
}
