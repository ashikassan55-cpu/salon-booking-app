import type { Service } from "@/lib/types";

/**
 * Placeholder data so the UI can be built/reviewed before the Supabase
 * project is connected. Replace with a real `services` fetch in Phase 4.
 */
export const mockServices: Service[] = [
  {
    id: "1",
    name: "Classic Cut",
    description: "A timeless, precise cut tailored to you.",
    price: 30,
    duration_minutes: 30,
    image_url: null,
  },
  {
    id: "2",
    name: "Signature Style",
    description: "Our most-requested full styling service.",
    price: 50,
    duration_minutes: 45,
    image_url: null,
  },
  {
    id: "3",
    name: "Beard Trim",
    description: "Shape and detail for a sharp finish.",
    price: 25,
    duration_minutes: 20,
    image_url: null,
  },
  {
    id: "4",
    name: "Hair Wash & Treatment",
    description: "Relaxing wash with a nourishing treatment.",
    price: 25,
    duration_minutes: 25,
    image_url: null,
  },
  {
    id: "5",
    name: "Kids Cut",
    description: "A gentle, friendly cut for younger guests.",
    price: 20,
    duration_minutes: 20,
    image_url: null,
  },
  {
    id: "6",
    name: "Full Service",
    description: "Cut, wash, and style in one appointment.",
    price: 65,
    duration_minutes: 60,
    image_url: null,
  },
];
