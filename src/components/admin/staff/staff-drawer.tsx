"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Service, Staff, StaffServicePricing } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";
import {
  compressImageToWebp,
  STAFF_PHOTO_COMPRESSION_OPTIONS,
} from "@/lib/image-compression";
import { createStaff, updateStaff } from "@/app/admin/(shell)/staff/actions";
import { WeeklyScheduleEditor } from "./weekly-schedule-editor";
import { ServicePricingPicker } from "./service-pricing-picker";

type StaffDrawerProps = {
  staff: Staff | null;
  pricing: StaffServicePricing[];
  services: Service[];
  defaultSchedule: WorkingHourEntry[];
  onClose: () => void;
  onSaved: () => void;
};

export function StaffDrawer({
  staff,
  pricing,
  services,
  defaultSchedule,
  onClose,
  onSaved,
}: StaffDrawerProps) {
  const t = useTranslations("AdminStaff.drawer");
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!staff;

  const [photoState, setPhotoState] = useState<{
    compressing: boolean;
    file: File | null;
    previewUrl: string | null;
  }>({ compressing: false, file: null, previewUrl: null });

  const [schedule, setSchedule] = useState<WorkingHourEntry[]>(
    staff?.schedule ?? defaultSchedule,
  );
  const [servicePricing, setServicePricing] =
    useState<StaffServicePricing[]>(pricing);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoState({ compressing: true, file: null, previewUrl: null });

    try {
      const compressed = await compressImageToWebp(
        file,
        undefined,
        STAFF_PHOTO_COMPRESSION_OPTIONS,
      );
      setPhotoState({
        compressing: false,
        file: compressed,
        previewUrl: URL.createObjectURL(compressed),
      });
    } catch {
      setError(t("photoError"));
      setPhotoState({ compressing: false, file: null, previewUrl: null });
    }
  }

  async function handleSave() {
    if (!formRef.current) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(formRef.current);
    if (photoState.file) {
      formData.set("photo", photoState.file);
    } else {
      formData.delete("photo");
    }
    formData.set("schedule", JSON.stringify(schedule));
    formData.set("pricing", JSON.stringify(servicePricing));

    const result = isEdit
      ? await updateStaff(staff.id, formData)
      : await createStaff(formData);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-md flex-col border-s border-admin-accent bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-admin-accent" />
              <span className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                {isEdit ? t("inspectorLabel") : t("newMemberLabel")}
              </span>
            </div>
            <p className="mt-0.5 font-admin-display text-sm font-bold text-admin-ink uppercase">
              {isEdit
                ? t("editTitle", { name: staff.name })
                : t("addTitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="p-1 text-admin-muted hover:text-admin-ink"
          >
            ✕
          </button>
        </div>

        <form
          ref={formRef}
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-4"
        >
          <div className="flex flex-col items-center gap-2 border-b border-admin-border pb-4 text-center">
            {(photoState.previewUrl || staff?.photoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview only
              <img
                src={photoState.previewUrl ?? staff?.photoUrl ?? ""}
                alt={t("previewAlt")}
                className="h-20 w-20 rounded-full border border-admin-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-admin-border text-admin-muted">
                {t("photoPlaceholder")}
              </div>
            )}
            {photoState.compressing && (
              <p className="text-xs text-admin-muted">{t("compressing")}</p>
            )}
            <label
              htmlFor="photo"
              className="cursor-pointer border border-dashed border-admin-border px-3 py-1.5 text-xs text-admin-muted transition-colors hover:border-admin-accent"
            >
              {staff?.photoUrl ? t("replacePhoto") : t("uploadPhoto")}
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
            >
              {t("fullNameLabel")}
            </label>
            <input
              id="name"
              name="name"
              defaultValue={staff?.name ?? ""}
              placeholder={t("fullNamePlaceholder")}
              className="border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="role"
              className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
            >
              {t("roleLabel")}
            </label>
            <input
              id="role"
              name="role"
              defaultValue={staff?.role ?? ""}
              placeholder={t("rolePlaceholder")}
              className="border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-admin-border pt-3">
            <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
              {t("weeklySchedule")}
            </p>
            <WeeklyScheduleEditor value={schedule} onChange={setSchedule} />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-admin-border pt-3">
            <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
              {t("servicesPricing")}
            </p>
            <ServicePricingPicker
              services={services}
              value={servicePricing}
              onChange={setServicePricing}
            />
          </div>

          {error && (
            <p className="text-sm text-admin-error" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center gap-2 border-t border-admin-border bg-admin-bg p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-admin-border bg-admin-surface py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-ink uppercase transition-colors hover:bg-admin-bg"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || photoState.compressing}
            className="flex-1 bg-admin-accent py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
