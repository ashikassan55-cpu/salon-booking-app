import { getTranslations } from "next-intl/server";
import type { Testimonial } from "@/lib/types";
import { TestimonialSlider } from "./testimonial-slider";

export async function TestimonialSection() {
  const t = await getTranslations("PublicTestimonials");
  const testimonials = t.raw("items") as Testimonial[];

  return (
    <section className="border-t border-border-dark bg-surface-dark px-6 py-16 text-foreground-dark">
      <div className="mx-auto max-w-4xl">
        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  );
}
