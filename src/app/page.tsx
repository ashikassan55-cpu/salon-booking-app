import { BookingSection } from "@/components/booking/booking-section";
import { GallerySection } from "@/components/gallery/gallery-section";
import { Hero } from "@/components/home/hero";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ServicesSection } from "@/components/services/services-section";
import { TeamSection } from "@/components/team/team-section";
import { TestimonialSection } from "@/components/testimonials/testimonial-section";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import type { BookingStylist, HeroSlide, StaffReview, TeamMember } from "@/lib/types";
import type { WorkingHourEntry } from "@/lib/settings";

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: services },
    { data: gallery },
    { data: staffRows },
    { data: staffServices },
    { data: staffRatings },
    { data: reviewRows },
    { data: heroSlideRows },
    settings,
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("staff_services").select("*"),
    supabase.from("staff_ratings").select("*"),
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true }),
    getSiteSettings(),
  ]);

  const reviews: StaffReview[] = (reviewRows ?? []).map((row) => ({
    id: row.id,
    staffId: row.staff_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));

  const heroSlides: HeroSlide[] = (heroSlideRows ?? []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption,
    sortOrder: row.sort_order,
  }));

  // Filtered explicitly (not just relying on RLS) so an admin browsing the
  // public site while signed in still sees exactly what a real visitor sees.
  const activeStaffRows = (staffRows ?? []).filter((row) => row.is_active);
  const ratingsByStaffId = new Map(
    (staffRatings ?? []).map((r) => [r.staff_id, r]),
  );

  const team: TeamMember[] = activeStaffRows.map((row) => {
    const rating = ratingsByStaffId.get(row.id);
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      photoUrl: row.photo_url,
      avgRating: rating?.avg_rating ?? null,
      reviewCount: rating?.review_count ?? 0,
      bio: row.bio,
      suiteLabel: row.suite_label,
    };
  });

  const bookingStylists: BookingStylist[] = activeStaffRows.map((row) => {
    const rating = ratingsByStaffId.get(row.id);
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      photoUrl: row.photo_url,
      avgRating: rating?.avg_rating ?? null,
      reviewCount: rating?.review_count ?? 0,
      bio: row.bio,
      suiteLabel: row.suite_label,
      schedule: (row.schedule as WorkingHourEntry[]) ?? settings.workingHours,
    };
  });

  return (
    <>
      <SiteHeader siteName={settings.name} />
      <main className="flex-1">
        <Hero
          siteName={settings.name}
          tagline={settings.tagline}
          slides={heroSlides}
        />
        <GallerySection items={gallery ?? []} />
        <TeamSection
          members={team}
          services={services ?? []}
          staffServices={staffServices ?? []}
          reviews={reviews}
        />
        <TestimonialSection />
        <ServicesSection services={services ?? []} />
        <BookingSection
          services={services ?? []}
          staff={bookingStylists}
          staffServices={staffServices ?? []}
          workingHours={settings.workingHours}
        />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
