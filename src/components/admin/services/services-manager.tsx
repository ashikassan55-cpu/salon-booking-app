"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/types";
import { deleteService } from "@/app/admin/(shell)/services/actions";
import { formatCurrency } from "@/lib/currency";
import { ServiceDrawer } from "./service-drawer";

function formatPrice(price: number) {
  return formatCurrency(price, false);
}

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; service: Service };

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this service from the catalog?")) return;
    setDeletingId(id);
    await deleteService(id);
    setDeletingId(null);
    router.refresh();
  }

  function handleSaved() {
    setDrawer({ mode: "closed" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-end justify-between border-b border-admin-border pb-4">
        <div>
          <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
            Catalog Management
          </p>
          <h1 className="mt-1 font-admin-display text-4xl font-bold tracking-tight text-admin-ink uppercase">
            Services
          </h1>
          <p className="mt-1 font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
            {services.length} active salon service
            {services.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawer({ mode: "create" })}
          className="bg-admin-accent px-4 py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800"
        >
          + Add Service
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-admin-border bg-admin-surface">
        {services.length === 0 ? (
          <p className="p-8 text-center text-sm text-admin-muted">
            No services yet — add your first one above.
          </p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-admin-accent bg-admin-bg font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="cursor-pointer transition-colors hover:bg-admin-row-hover"
                  onClick={() => setDrawer({ mode: "edit", service })}
                >
                  <td className="px-4 py-4 align-top">
                    <span className="block font-admin-display text-sm font-bold text-admin-ink uppercase">
                      {service.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top font-bold tabular-nums text-admin-ink">
                    {formatPrice(service.price)}
                  </td>
                  <td className="px-4 py-4 align-top tabular-nums text-admin-muted">
                    {service.duration_minutes} min
                  </td>
                  <td className="max-w-xs px-4 py-4 align-top text-admin-muted">
                    <p className="line-clamp-1">
                      {service.description || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right align-top whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawer({ mode: "edit", service });
                      }}
                      className="p-1.5 text-admin-muted hover:text-admin-ink"
                      title="Edit Service"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(service.id);
                      }}
                      disabled={deletingId === service.id}
                      className="ml-2 p-1.5 text-admin-muted hover:text-admin-error disabled:opacity-50"
                      title="Delete Service"
                    >
                      {deletingId === service.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawer.mode !== "closed" && (
        <ServiceDrawer
          service={drawer.mode === "edit" ? drawer.service : null}
          onClose={() => setDrawer({ mode: "closed" })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
