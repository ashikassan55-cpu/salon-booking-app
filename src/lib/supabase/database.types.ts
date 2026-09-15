/**
 * Hand-written to match supabase/migrations/*.sql (see that directory for
 * the authoritative schema). No live Supabase project to generate from yet
 * — once one exists, prefer `supabase gen types typescript` and replace
 * this file with the output.
 */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  created_at: string;
};

type ServiceInsert = {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
  image_url?: string | null;
  created_at?: string;
};

type ServiceUpdate = Partial<ServiceInsert>;

export type BookingRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string | null;
  service_name_snapshot: string;
  service_price_snapshot: number;
  service_date: string;
  status: BookingStatus;
  created_at: string;
  staff_id: string | null;
  staff_name_snapshot: string | null;
  service_duration_snapshot: number;
  review_token: string;
  reviewed_at: string | null;
};

type BookingInsert = {
  id?: string;
  customer_name: string;
  customer_phone: string;
  service_id?: string | null;
  service_name_snapshot: string;
  service_price_snapshot: number;
  service_date: string;
  status?: BookingStatus;
  created_at?: string;
  staff_id?: string | null;
  staff_name_snapshot?: string | null;
  service_duration_snapshot?: number;
  review_token?: string;
  reviewed_at?: string | null;
};

type BookingUpdate = Partial<BookingInsert>;

export type StaffRow = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  schedule: unknown;
  is_active: boolean;
  created_at: string;
};

type StaffInsert = {
  id?: string;
  name: string;
  role: string;
  photo_url?: string | null;
  schedule: unknown;
  is_active?: boolean;
  created_at?: string;
};

type StaffUpdate = Partial<StaffInsert>;

export type StaffServiceRow = {
  id: string;
  staff_id: string;
  service_id: string;
  custom_price: number | null;
  created_at: string;
};

type StaffServiceInsert = {
  id?: string;
  staff_id: string;
  service_id: string;
  custom_price?: number | null;
  created_at?: string;
};

type StaffServiceUpdate = Partial<StaffServiceInsert>;

export type ReviewRow = {
  id: string;
  booking_id: string;
  staff_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ReviewInsert = {
  id?: string;
  booking_id: string;
  staff_id: string;
  rating: number;
  comment?: string | null;
  created_at?: string;
};

type ReviewUpdate = Partial<ReviewInsert>;

export type StaffRatingsRow = {
  staff_id: string;
  avg_rating: number;
  review_count: number;
};

type GalleryRow = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

type GalleryInsert = {
  id?: string;
  image_url: string;
  caption?: string | null;
  created_at?: string;
};

type GalleryUpdate = Partial<GalleryInsert>;

export type HeroSlideRow = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

type HeroSlideInsert = {
  id?: string;
  image_url: string;
  caption?: string | null;
  sort_order?: number;
  created_at?: string;
};

type HeroSlideUpdate = Partial<HeroSlideInsert>;

export type SiteSettingsRow = {
  id: string;
  name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  instagram_url: string | null;
  facebook_url: string | null;
  accent_color: string;
  working_hours: unknown;
  google_review_url: string | null;
  updated_at: string;
};

type SiteSettingsInsert = {
  id?: string;
  name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  instagram_url?: string | null;
  facebook_url?: string | null;
  accent_color?: string;
  working_hours: unknown;
  google_review_url?: string | null;
  updated_at?: string;
};

type SiteSettingsUpdate = Partial<SiteSettingsInsert>;

export type Database = {
  public: {
    Tables: {
      services: {
        Row: ServiceRow;
        Insert: ServiceInsert;
        Update: ServiceUpdate;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: BookingUpdate;
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery: {
        Row: GalleryRow;
        Insert: GalleryInsert;
        Update: GalleryUpdate;
        Relationships: [];
      };
      hero_slides: {
        Row: HeroSlideRow;
        Insert: HeroSlideInsert;
        Update: HeroSlideUpdate;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsInsert;
        Update: SiteSettingsUpdate;
        Relationships: [];
      };
      staff: {
        Row: StaffRow;
        Insert: StaffInsert;
        Update: StaffUpdate;
        Relationships: [];
      };
      staff_services: {
        Row: StaffServiceRow;
        Insert: StaffServiceInsert;
        Update: StaffServiceUpdate;
        Relationships: [
          {
            foreignKeyName: "staff_services_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      staff_ratings: {
        Row: StaffRatingsRow;
        Relationships: [];
      };
    };
    Functions: {
      get_booking_for_review: {
        Args: { p_token: string };
        Returns: {
          booking_id: string;
          service_name: string;
          staff_name: string | null;
          status: BookingStatus;
          reviewed_at: string | null;
        }[];
      };
      submit_review: {
        Args: { p_token: string; p_rating: number; p_comment: string | null };
        Returns: { ok: boolean; error_code: string | null }[];
      };
    };
  };
};
