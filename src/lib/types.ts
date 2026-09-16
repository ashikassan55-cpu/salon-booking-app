import type { WorkingHourEntry } from "./settings";

export type { BookingRow as Booking, BookingStatus } from "./supabase/database.types";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
};

export type GalleryItem = {
  id: string;
  caption: string | null;
  image_url: string | null;
};

/** One homepage hero background slide. caption is optional per-slide text
 * that replaces the site tagline while that slide is showing. */
export type HeroSlide = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

/** A real, DB-backed stylist — admin-facing shape (full profile). */
export type Staff = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  schedule: WorkingHourEntry[];
  isActive: boolean;
  bio: string | null;
  suiteLabel: string | null;
};

/** One {service, price override} pairing for a stylist. */
export type StaffServicePricing = {
  serviceId: string;
  customPrice: number | null;
};

/** Public-facing team member — what the homepage Team section renders. */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  bio: string | null;
  suiteLabel: string | null;
};

/** A stylist as the booking flow needs them — same public fields as
 * TeamMember, plus their weekly schedule for calendar/availability math. */
export type BookingStylist = TeamMember & {
  schedule: WorkingHourEntry[];
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
};

/** A real customer review for one stylist, from the reviews table. */
export type StaffReview = {
  id: string;
  staffId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

/** One {service, price} a stylist actually performs — real data joined from
 * staff_services + services, used by the public profile modal's Services tab. */
export type StaffServiceOffering = {
  serviceId: string;
  name: string;
  price: number;
};
