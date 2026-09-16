"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { SiteSettings, WorkingHourEntry } from "@/lib/settings";
import { getContrastColor } from "@/lib/color";
import { WeeklyScheduleEditor } from "@/components/admin/staff/weekly-schedule-editor";
import {
  updateSiteSettings,
  type SettingsFormState,
} from "@/app/admin/(shell)/settings/actions";

const initialState: SettingsFormState = { error: null };

function SectionCard({
  step,
  title,
  tag,
  children,
}: {
  step: string;
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-admin-border bg-admin-surface p-6">
      <div className="flex items-center justify-between border-b border-admin-border pb-3">
        <p className="font-admin-display text-sm font-bold tracking-wide text-admin-ink uppercase">
          <span className="text-admin-muted">{step} /</span> {title}
        </p>
        <span className="border border-admin-border px-2 py-0.5 font-admin-display text-[10px] font-bold tracking-wider text-admin-muted uppercase">
          {tag}
        </span>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
        >
          {label}
        </label>
        {helper && <span className="text-[11px] text-admin-muted">{helper}</span>}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-admin-border bg-admin-bg px-3 py-2 text-sm focus:border-admin-accent focus:outline-none";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("AdminSettings");
  const [state, formAction, pending] = useActionState(
    updateSiteSettings,
    initialState,
  );
  const [workingHours, setWorkingHours] = useState<WorkingHourEntry[]>(
    settings.workingHours,
  );
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const saved = state !== initialState && !state.error;

  const previewForeground = getContrastColor(accentColor);

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="workingHours"
        value={JSON.stringify(workingHours)}
        readOnly
      />

      <SectionCard
        step="01"
        title={t("sections.businessInfo.title")}
        tag={t("sections.businessInfo.tag")}
      >
        <Field label={t("fields.salonName")} htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={settings.name}
            className={inputClass}
          />
        </Field>
        <Field label={t("fields.tagline")} htmlFor="tagline">
          <input
            id="tagline"
            name="tagline"
            defaultValue={settings.tagline}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.contactEmail")} htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email}
              className={inputClass}
            />
          </Field>
          <Field label={t("fields.phoneNumber")} htmlFor="phone">
            <input
              id="phone"
              name="phone"
              defaultValue={settings.phone}
              className={inputClass}
            />
          </Field>
        </div>
        <Field
          label={t("fields.whatsappNumber")}
          htmlFor="whatsappNumber"
          helper={t("fields.whatsappHelper")}
        >
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            className={inputClass}
          />
        </Field>
        <Field label={t("fields.address")} htmlFor="address">
          <textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={settings.address}
            className={inputClass}
          />
        </Field>
      </SectionCard>

      <SectionCard
        step="02"
        title={t("sections.workingHours.title")}
        tag={t("sections.workingHours.tag")}
      >
        <WeeklyScheduleEditor value={workingHours} onChange={setWorkingHours} />
      </SectionCard>

      <SectionCard
        step="03"
        title={t("sections.socialLinks.title")}
        tag={t("sections.socialLinks.tag")}
      >
        <Field label={t("fields.instagramProfile")} htmlFor="instagramUrl">
          <input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            placeholder="https://instagram.com/yoursalon"
            defaultValue={settings.instagramUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label={t("fields.facebookPage")} htmlFor="facebookUrl">
          <input
            id="facebookUrl"
            name="facebookUrl"
            type="url"
            placeholder="https://facebook.com/yoursalon"
            defaultValue={settings.facebookUrl ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label={t("fields.googleReviewLink")}
          htmlFor="googleReviewUrl"
          helper={t("fields.googleReviewHelper")}
        >
          <input
            id="googleReviewUrl"
            name="googleReviewUrl"
            type="url"
            placeholder="https://g.page/r/yoursalon/review"
            defaultValue={settings.googleReviewUrl ?? ""}
            className={inputClass}
          />
        </Field>
      </SectionCard>

      <SectionCard
        step="04"
        title={t("sections.brandColor.title")}
        tag={t("sections.brandColor.tag")}
      >
        <Field
          label={t("fields.customHex")}
          htmlFor="accentColor"
          helper={t("fields.customHexHelper")}
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={t("fields.pickColor")}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-9 w-9 shrink-0 cursor-pointer border border-admin-border bg-admin-bg p-0.5"
            />
            <input
              id="accentColor"
              name="accentColor"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className={`${inputClass} font-mono uppercase`}
              maxLength={7}
            />
          </div>
        </Field>

        <div>
          <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
            {t("livePreview")}
          </p>
          <div
            className="mt-2 flex items-center gap-3 border border-admin-border p-4"
            style={{ backgroundColor: accentColor }}
          >
            <span
              className="border px-4 py-2 font-admin-display text-xs font-bold tracking-wider uppercase"
              style={{ borderColor: previewForeground, color: previewForeground }}
            >
              {t("bookNowPreview")}
            </span>
            <span
              className="text-xs"
              style={{ color: previewForeground, opacity: 0.8 }}
            >
              {accentColor.toUpperCase()}
            </span>
          </div>
        </div>
      </SectionCard>

      {state.error && (
        <p className="text-sm text-admin-error" role="alert">
          {state.error}
        </p>
      )}
      {!state.error && saved && (
        <p className="text-sm text-green-700" role="status">
          {t("saved")}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-admin-accent px-5 py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
