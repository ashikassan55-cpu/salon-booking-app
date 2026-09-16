import { getTranslations } from "next-intl/server";
import type { GalleryItem } from "@/lib/types";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

function GalleryTile({ item }: { item: GalleryItem }) {
  return (
    <div className="relative overflow-hidden">
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
        <span className="absolute bottom-3 start-3 bg-black/70 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
          {item.caption}
        </span>
      )}
    </div>
  );
}

/** Round-robin distribution into a fixed number of columns — unlike CSS
 * multi-column (`columns-*`), each column's rendered height is exactly the
 * sum of its own tiles, so the container can never be taller than its
 * tallest column. CSS multi-column's browser-side "balancing" pass was
 * leaving a large dead gap below the actual photos with a small, uneven
 * set of images (a known limitation of that layout, not a one-off bug). */
function distributeIntoColumns(items: GalleryItem[], columnCount: number) {
  const columns: GalleryItem[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => columns[i % columnCount].push(item));
  return columns;
}

function GalleryColumns({
  items,
  columnCount,
  className = "",
}: {
  items: GalleryItem[];
  columnCount: number;
  className?: string;
}) {
  const columns = distributeIntoColumns(items, columnCount);
  return (
    // `className` supplies its own display utility (e.g. "flex lg:hidden")
    // — deliberately not hardcoded here, since mixing a hardcoded "flex"
    // with a caller-passed "hidden" at the same breakpoint is an
    // unprefixed-utility conflict with no guaranteed winner.
    <div className={`items-start gap-4 ${className}`}>
      {columns.map((column, i) => (
        <div key={i} className="flex flex-1 flex-col gap-4">
          {column.map((item) => (
            <GalleryTile key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

export async function GallerySection({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  const t = await getTranslations("PublicGallery");

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
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight uppercase sm:text-3xl">
            {t("heading")}
          </h2>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          {t("portfolio", { count: items.length })}
        </p>
      </div>

      {/* Two pre-computed column layouts (2-col below lg, 3-col at lg+),
          swapped via responsive visibility — avoids any client-side
          re-layout/hydration for something this simple. */}
      <GalleryColumns
        items={items}
        columnCount={2}
        className="mt-14 flex lg:hidden"
      />
      <GalleryColumns
        items={items}
        columnCount={3}
        className="mt-14 hidden lg:flex"
      />
    </section>
  );
}
