"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Service } from "@/lib/types";
import { compressImageToWebp } from "@/lib/image-compression";
import { createService, updateService } from "@/app/admin/(shell)/services/actions";

type ServiceDrawerProps = {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function ServiceDrawer({ service, onClose, onSaved }: ServiceDrawerProps) {
  const t = useTranslations("AdminServices.drawer");
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!service;

  const [imageState, setImageState] = useState<{
    compressing: boolean;
    file: File | null;
    previewUrl: string | null;
    originalSize: number | null;
  }>({ compressing: false, file: null, previewUrl: null, originalSize: null });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageState({
      compressing: true,
      file: null,
      previewUrl: null,
      originalSize: file.size,
    });

    try {
      const compressed = await compressImageToWebp(file);
      setImageState({
        compressing: false,
        file: compressed,
        previewUrl: URL.createObjectURL(compressed),
        originalSize: file.size,
      });
    } catch {
      setError(t("imageError"));
      setImageState({
        compressing: false,
        file: null,
        previewUrl: null,
        originalSize: null,
      });
    }
  }

  async function handleSave() {
    if (!formRef.current) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(formRef.current);
    if (imageState.file) {
      formData.set("image", imageState.file);
    } else {
      formData.delete("image");
    }

    const result = isEdit
      ? await updateService(service.id, formData)
      : await createService(formData);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSaved();
  }

  const savingsPercent =
    imageState.originalSize && imageState.file
      ? Math.round((1 - imageState.file.size / imageState.originalSize) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-md flex-col border-s border-admin-accent bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-admin-accent" />
              <span className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                {isEdit ? t("inspectorLabel") : t("newItemLabel")}
              </span>
            </div>
            <p className="mt-0.5 font-admin-display text-sm font-bold text-admin-ink uppercase">
              {isEdit
                ? t("editTitle", { name: service.name })
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
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
            >
              {t("nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              defaultValue={service?.name ?? ""}
              placeholder={t("namePlaceholder")}
              className="border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="description"
              className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
            >
              {t("descriptionLabel")}
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={service?.description ?? ""}
              rows={3}
              placeholder={t("descriptionPlaceholder")}
              className="border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="price"
                className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
              >
                {t("priceLabel")}
              </label>
              <div className="flex items-center border border-admin-border focus-within:border-admin-accent">
                <span className="border-e border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-muted">
                  AED
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={service?.price ?? ""}
                  placeholder="0.00"
                  className="w-full bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="duration_minutes"
                className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
              >
                {t("durationLabel")}
              </label>
              <input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                step="5"
                min="5"
                defaultValue={service?.duration_minutes ?? ""}
                placeholder="60"
                className="border border-admin-border px-3 py-2 text-sm tabular-nums focus:border-admin-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-admin-border pt-3">
            <div className="flex items-center justify-between">
              <label className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
                {t("imageLabel")}
              </label>
              <span className="font-admin-display text-[10px] font-bold text-admin-accent uppercase">
                {t("autoOptimized")}
              </span>
            </div>

            {(imageState.previewUrl || service?.image_url) && (
              <div className="flex items-center gap-3 border border-admin-border bg-admin-bg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview only */}
                <img
                  src={imageState.previewUrl ?? service?.image_url ?? ""}
                  alt={t("previewAlt")}
                  className="h-14 w-14 shrink-0 border border-admin-border object-cover"
                />
                {imageState.file && imageState.originalSize && (
                  <div className="min-w-0 text-xs">
                    <span className="bg-admin-accent px-1.5 py-0.5 font-admin-display font-bold tracking-wider text-admin-accent-ink uppercase">
                      {t("convertedToWebp")}
                    </span>
                    <p className="mt-1 tabular-nums text-admin-muted">
                      {formatBytes(imageState.originalSize)} &rarr;{" "}
                      <span className="font-bold text-admin-ink">
                        {formatBytes(imageState.file.size)}
                      </span>
                      {savingsPercent !== null && savingsPercent > 0 && (
                        <span className="font-bold text-admin-ink">
                          {" "}
                          (-{savingsPercent}%)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {imageState.compressing && (
              <p className="text-xs text-admin-muted">{t("compressing")}</p>
            )}

            <label
              htmlFor="image"
              className="cursor-pointer border border-dashed border-admin-border p-2 text-center text-xs text-admin-muted transition-colors hover:border-admin-accent"
            >
              {t("dragDrop")}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
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
            disabled={saving || imageState.compressing}
            className="flex-1 bg-admin-accent py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
