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

  const { data, error } = await supabase.rpc("get_booking_for_review", {
    p_token: token,
  });
  const booking = data?.[0];

  if (error || !booking) {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">Review link not found</p>
        <p className="mt-2 text-sm text-muted-dark">
          This link may have expired or been mistyped.
        </p>
      </StatusScreen>
    );
  }

  if (booking.reviewed_at) {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">
          Thank you, you have already submitted your review for this visit.
        </p>
      </StatusScreen>
    );
  }

  if (booking.status !== "completed") {
    return (
      <StatusScreen>
        <p className="text-lg font-semibold">
          This booking hasn&apos;t been completed yet.
        </p>
        <p className="mt-2 text-sm text-muted-dark">
          Check back after your appointment to leave a review.
        </p>
      </StatusScreen>
    );
  }

  return (
    <StatusScreen>
      <ReviewForm
        token={token}
        stylistName={booking.staff_name ?? "your stylist"}
        serviceName={booking.service_name}
        googleReviewUrl={settings.googleReviewUrl}
      />
    </StatusScreen>
  );
}
