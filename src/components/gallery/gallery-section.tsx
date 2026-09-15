import type { GalleryItem } from "@/lib/types";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

function GalleryTile({ item }: { item: GalleryItem }) {
  return (
    <div className="relative mb-4 break-inside-avoid overflow-hidden">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, not a build-time asset
        <img
          src={item.image_url}
          alt={item.caption ?? ""}
          className="h-auto w-full"
        />
      ) : (
        <PlaceholderImage className="aspect-square w-full" />
      )}
      {item.caption && (
        <span className="absolute bottom-3 left-3 bg-black/70 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
          {item.caption}
        </span>
      )}
    </div>
  );
}

export function GallerySection({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    // Deliberately full-bleed (no max-w-6xl centering, unlike every other
    // section) — an edge-to-edge "photographic archive" treatment, matching
    // the supplied reference exactly rather than the site's usual centered
    // container.
    <section
      id="gallery"
      className="bg-background px-4 py-24 text-foreground sm:px-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
            Why choose us
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight uppercase sm:text-3xl">
            Explore our work & process
          </h2>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          Portfolio // {items.length} photo{items.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Masonry via CSS columns: every photo keeps its own natural aspect
          ratio (no object-cover, no forced rectangle) — a mix of portrait
          headshots and landscape shots never gets cropped or leaves
          mismatched-height gaps, unlike a fixed-aspect grid. */}
      <div className="mt-14 columns-2 gap-4 lg:columns-3">
        {items.map((item) => (
          <GalleryTile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
