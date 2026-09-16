import { getTranslations } from "next-intl/server";
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const t = await getTranslations("AdminSettings");

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

      <div className="mt-8 max-w-2xl">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
