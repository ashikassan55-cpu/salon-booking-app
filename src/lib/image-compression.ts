import imageCompression from "browser-image-compression";

export const GALLERY_IMAGE_COMPRESSION_OPTIONS = {
  fileType: "image/webp",
  initialQuality: 0.85,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
} as const;

function toWebpFilename(originalName: string) {
  const base = originalName.replace(/\.[^./\\]+$/, "");
  return `${base || "image"}.webp`;
}

/** Smaller than the gallery default — headshots render as small circular avatars. */
export const STAFF_PHOTO_COMPRESSION_OPTIONS = {
  ...GALLERY_IMAGE_COMPRESSION_OPTIONS,
  maxWidthOrHeight: 500,
} as const;

/** Larger than the gallery default — hero banners render full-bleed, often
 * at large viewport widths, so they need more resolution than a thumbnail.
 * maxSizeMB enforces the "max 2MB" recommendation shown to admins as a hard
 * cap, not just a guideline. */
export const HERO_IMAGE_COMPRESSION_OPTIONS = {
  ...GALLERY_IMAGE_COMPRESSION_OPTIONS,
  maxWidthOrHeight: 1920,
  maxSizeMB: 2,
} as const;

type CompressionOptions = {
  fileType?: string;
  initialQuality?: number;
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
};

/** Compresses and force-converts an image to WebP, client-side only. */
export async function compressImageToWebp(
  file: File,
  onProgress?: (progress: number) => void,
  overrides?: CompressionOptions,
): Promise<File> {
  const compressed = await imageCompression(file, {
    ...GALLERY_IMAGE_COMPRESSION_OPTIONS,
    ...overrides,
    onProgress,
  });

  return new File([compressed], toWebpFilename(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
