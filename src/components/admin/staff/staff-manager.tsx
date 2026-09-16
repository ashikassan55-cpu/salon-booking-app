"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Service, Staff, StaffServicePricing } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";
import {
  deactivateStaff,
  reactivateStaff,
} from "@/app/admin/(shell)/staff/actions";
import { StaffDrawer } from "./staff-drawer";

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; staff: Staff };

export function StaffManager({
  staff,
  pricingByStaffId,
  services,
  defaultSchedule,
}: {
  staff: Staff[];
  pricingByStaffId: Record<string, StaffServicePricing[]>;
  services: Service[];
  defaultSchedule: WorkingHourEntry[];
}) {
  const router = useRouter();
  const t = useTranslations("AdminStaff");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggleActive(member: Staff) {
    setTogglingId(member.id);
    await (member.isActive ? deactivateStaff(member.id) : reactivateStaff(member.id));
    setTogglingId(null);
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
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 font-admin-display text-4xl font-bold tracking-tight text-admin-ink uppercase">
            {t("heading")}
          </h1>
          <p className="mt-1 font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
            {t("stylistCount", { count: staff.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawer({ mode: "create" })}
          className="bg-admin-accent px-4 py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800"
        >
          {t("addMember")}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-admin-border bg-admin-surface">
        {staff.length === 0 ? (
          <p className="p-8 text-center text-sm text-admin-muted">
            {t("emptyState")}
          </p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-admin-accent bg-admin-bg font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                <th className="px-4 py-3">{t("columns.stylist")}</th>
                <th className="px-4 py-3">{t("columns.role")}</th>
                <th className="px-4 py-3">{t("columns.services")}</th>
                <th className="px-4 py-3">{t("columns.status")}</th>
                <th className="px-4 py-3 text-end">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="cursor-pointer transition-colors hover:bg-admin-row-hover"
                  onClick={() => setDrawer({ mode: "edit", staff: member })}
                >
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small thumbnail
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="h-10 w-10 shrink-0 rounded-full border border-admin-border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-bg font-admin-display text-xs font-bold text-admin-muted">
                          {member.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <span className="font-admin-display text-sm font-bold text-admin-ink uppercase">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-admin-muted">
                    {member.role}
                  </td>
                  <td className="px-4 py-4 align-top tabular-nums text-admin-muted">
                    {(pricingByStaffId[member.id] ?? []).length}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`border px-1.5 py-0.5 font-admin-display text-[10px] font-bold tracking-wider uppercase ${
                        member.isActive
                          ? "border-admin-accent bg-admin-accent text-admin-accent-ink"
                          : "border-admin-border text-admin-muted"
                      }`}
                    >
                      {member.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-end align-top whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawer({ mode: "edit", staff: member });
                      }}
                      className="p-1.5 text-admin-muted hover:text-admin-ink"
                      title={t("editStylist")}
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(member);
                      }}
                      disabled={togglingId === member.id}
                      className="ms-2 p-1.5 text-admin-muted hover:text-admin-error disabled:opacity-50"
                      title={member.isActive ? t("deactivate") : t("reactivate")}
                    >
                      {togglingId === member.id
                        ? t("toggling")
                        : member.isActive
                          ? t("deactivate")
                          : t("reactivate")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawer.mode !== "closed" && (
        <StaffDrawer
          staff={drawer.mode === "edit" ? drawer.staff : null}
          pricing={
            drawer.mode === "edit" ? (pricingByStaffId[drawer.staff.id] ?? []) : []
          }
          services={services}
          defaultSchedule={defaultSchedule}
          onClose={() => setDrawer({ mode: "closed" })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
