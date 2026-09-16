import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { ReviewForm } from "@/components/review/review-form";

function StatusScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark px-6 text-center text-foreground-dark">
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

export default async function RatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const settings = await getSiteSettings();
  const t = await getTranslations("PublicReview");

  const { data, error } = await supabase.rpc("get_booking_for_review", {
    p_token: token,
  });
  const booking = data?.[0];

  if (error || !booking) {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">{t("linkNotFound")}</p>
        <p className="mt-2 text-sm text-muted-dark">{t("linkNotFoundHint")}</p>
      </StatusScreen>
    );
  }

  if (booking.reviewed_at) {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">{t("alreadySubmitted")}</p>
      </StatusScreen>
    );
  }

  if (booking.status !== "completed") {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">{t("notCompleted")}</p>
        <p className="mt-2 text-sm text-muted-dark">{t("notCompletedHint")}</p>
      </StatusScreen>
    );
  }

  return (
    <StatusScreen>
      <ReviewForm
        token={token}
        stylistName={booking.staff_name ?? t("defaultStylistName")}
        serviceName={booking.service_name}
        googleReviewUrl={settings.googleReviewUrl}
      />
    </StatusScreen>
  );
}
