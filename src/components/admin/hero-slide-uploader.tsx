"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  compressImageToWebp,
  HERO_IMAGE_COMPRESSION_OPTIONS,
} from "@/lib/image-compression";
import { uploadHeroSlide } from "@/app/admin/(shell)/hero/actions";

type Stage = "idle" | "compressing" | "ready" | "uploading" | "done";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function HeroSlideUploader() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setCompressedFile(null);
    setPreviewUrl(null);
    setStage("compressing");
    setProgress(0);
    setOriginalSize(file.size);

    try {
      const compressed = await compressImageToWebp(
        file,
        setProgress,
        HERO_IMAGE_COMPRESSION_OPTIONS,
      );
      setCompressedFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setStage("ready");
    } catch {
      setError("Couldn't process that image — try a different file.");
      setStage("idle");
    }
  }

  async function handleUpload() {
    if (!compressedFile) return;
    setStage("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("file", compressedFile);
    formData.set("caption", caption);

    const result = await uploadHeroSlide(formData);

    if (result.error) {
      setError(result.error);
      setStage("ready");
      return;
    }

    setStage("done");
    setCompressedFile(null);
    setPreviewUrl(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  const savingsPercent =
    originalSize && compressedFile
      ? Math.round((1 - compressedFile.size / originalSize) * 100)
      : null;

  const busy = stage === "compressing" || stage === "uploading";

  return (
    <div className="border border-admin-border bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-ink uppercase">
          ■ Upload Banner Image
        </p>
        <p className="font-admin-display text-[10px] font-bold tracking-widest text-admin-muted uppercase">
          Auto-Optimized
        </p>
      </div>

      <label
        htmlFor="hero-file"
        className="mt-4 flex cursor-pointer flex-col items-center gap-1 border border-dashed border-admin-border px-4 py-8 text-center transition-colors hover:border-admin-accent"
      >
        <span className="font-admin-display text-xs font-bold tracking-wider text-admin-ink uppercase">
          Click to choose a photo
        </span>
        <span className="text-xs text-admin-muted">
          Recommended size: 1920×1080px (16:9 ratio), max 2MB. Keep focal
          subjects centered — edges may crop on some screens.
        </span>
      </label>
      <input
        ref={fileInputRef}
        id="hero-file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={busy}
        className="sr-only"
      />

      {stage === "compressing" && (
        <p className="mt-3 font-admin-display text-xs font-bold tracking-wide text-admin-muted uppercase">
          Compressing… {progress}%
        </p>
      )}

      {compressedFile && previewUrl && (
        <div className="mt-4 flex items-start gap-4 border border-admin-border bg-admin-bg p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient client-side blob preview, not a served asset */}
          <img
            src={previewUrl}
            alt="Compressed preview"
            className="h-16 w-16 shrink-0 border border-admin-border object-cover"
          />
          <div className="text-xs">
            <span className="bg-admin-accent px-1.5 py-0.5 font-admin-display font-bold tracking-wider text-admin-accent-ink uppercase">
              Converted to WebP
            </span>
            <p className="mt-1.5 tabular-nums text-admin-muted">
              {formatBytes(originalSize ?? 0)} &rarr;{" "}
              <span className="font-bold text-admin-ink">
                {formatBytes(compressedFile.size)}
              </span>
              {savingsPercent !== null && savingsPercent > 0 && (
                <span className="font-bold text-admin-ink">
                  {" "}
                  (-{savingsPercent}%)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {stage === "ready" && (
        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="hero-caption"
              className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase"
            >
              Caption (Optional — replaces the tagline while this slide shows)
            </label>
            <input
              id="hero-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 w-full border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            className="bg-admin-accent px-4 py-2.5 font-admin-display text-xs font-bold tracking-wider text-admin-accent-ink uppercase transition-colors hover:bg-neutral-800"
          >
            Confirm &amp; Add Slide
          </button>
        </div>
      )}

      {stage === "uploading" && (
        <p className="mt-3 font-admin-display text-xs font-bold tracking-wide text-admin-muted uppercase">
          Uploading…
        </p>
      )}

      {stage === "done" && (
        <p className="mt-3 text-sm text-green-700" role="status">
          Uploaded — it&apos;s now live in the homepage rotation.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-admin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
