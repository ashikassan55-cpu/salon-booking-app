import { getTranslations } from "next-intl/server";
import { GalleryGrid } from "@/components/admin/gallery-grid";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { createClient } from "@/lib/supabase/server";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: images, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });
  const t = await getTranslations("AdminGallery");

  return (
    <div>
      <p className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mt-1 font-admin-display text-4xl font-bold tracking-tight text-admin-ink uppercase">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-admin-muted">
        {t("subtitle")}
      </p>

      <div className="mt-8">
        <GalleryUploader />
      </div>

      <div className="mt-10">
        <h2 className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
          {t("currentGallery", { count: images?.length ?? 0 })}
        </h2>

        {error ? (
          <p className="mt-3 text-sm text-admin-error" role="alert">
            {t("loadError", { message: error.message })}
          </p>
        ) : (
          <div className="mt-4">
            <GalleryGrid items={images ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
