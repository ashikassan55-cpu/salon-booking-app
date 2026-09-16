import { getTranslations } from "next-intl/server";
import { HeroSlidesGrid } from "@/components/admin/hero-slides-grid";
import { HeroSlideUploader } from "@/components/admin/hero-slide-uploader";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data: slides, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  const t = await getTranslations("AdminHero");

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
        <HeroSlideUploader />
      </div>

      <div className="mt-10">
        <h2 className="font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
          {t("currentSlides", { count: slides?.length ?? 0 })}
        </h2>

        {error ? (
          <p className="mt-3 text-sm text-admin-error" role="alert">
            {t("loadError", { message: error.message })}
          </p>
        ) : (
          <div className="mt-4">
            <HeroSlidesGrid slides={slides ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
