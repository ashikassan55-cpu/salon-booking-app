/**
 * Per-client site content. This, plus the brand tokens in globals.css and
 * the logo/hero assets, is what a new deployment should need to edit.
 */
export const siteConfig = {
  name: "Salon Name",
  tagline: "Book your next appointment in seconds.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ],
  bookingCta: "Book Now",
  /**
   * IANA timezone the salon operates in. Used for formatting booking
   * date/times and for the admin dashboard's Today/Week/Month boundaries.
   * See src/lib/timezone.ts for the fixed-offset conversion this assumes.
   */
  timezone: "Asia/Dubai",
  contact: {
    email: "hello@example.com",
    phone: "+1 (800) 123 456 789",
    // No "+" prefix and no leading zero — wa.me expects the bare
    // international-format number.
    whatsappNumber: "971501404437",
    address: "27 Division St, New York, NY 10002, USA",
  },
  social: {
    instagram: "",
    facebook: "",
    // Shown to customers who leave a 4-5 star review on /rate/[token], as an
    // optional "share this publicly" prompt. Empty until the admin sets a
    // real Google Business review link in Site Settings.
    googleReviewUrl: "",
  },
  workingHours: [
    { days: "Mon - Fri", hours: "09:00 - 18:00", open: true },
    { days: "Saturday", hours: "10:00 - 16:00", open: true },
    { days: "Sunday", hours: "Closed", open: false },
  ],
} as const;

/**
 * Numeric hours for the booking calendar's day/slot logic. Keep in sync with
 * `workingHours` above (that one is display-only strings for the footer).
 * Maps JS Date.getDay() (0 = Sunday) to open/close hour.
 */
export const workingHoursByWeekday: Record<
  number,
  { open: boolean; startHour: number; endHour: number }
> = {
  0: { open: false, startHour: 0, endHour: 0 },
  1: { open: true, startHour: 9, endHour: 18 },
  2: { open: true, startHour: 9, endHour: 18 },
  3: { open: true, startHour: 9, endHour: 18 },
  4: { open: true, startHour: 9, endHour: 18 },
  5: { open: true, startHour: 9, endHour: 18 },
  6: { open: true, startHour: 10, endHour: 16 },
};
