"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/placeholder-image";

export function TestimonialSlider({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  if (!current) return null;

  return (
    <div>
      <div className="grid gap-10 sm:grid-cols-[auto_1fr] sm:items-center">
        <AvatarPlaceholder name={current.authorName} className="h-20 w-20" />

        <div>
          <p className="text-xl leading-relaxed font-medium sm:text-2xl">
            &ldquo;{current.quote}&rdquo;
          </p>
          <p className="mt-6 text-base font-semibold">
            {current.authorName}
          </p>
          <p className="text-xs tracking-wide text-muted-dark uppercase">
            {current.authorRole}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        {testimonials.map((testimonial, i) => (
          <button
            key={testimonial.id}
            type="button"
            aria-label={`Show testimonial ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-foreground-dark" : "bg-border-dark"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
