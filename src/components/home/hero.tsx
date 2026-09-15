"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { HeroSlide } from "@/lib/types";

const AUTOPLAY_MS = 6000;

export function Hero({
  siteName,
  tagline,
  slides,
}: {
  siteName: string;
  tagline: string;
  slides: HeroSlide[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[index] ?? null;

  return (
    <section className="relative w-full aspect-[16/9] overflow-hidden bg-surface-dark text-foreground-dark">
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, rotated via CSS opacity
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div
        aria-hidden
        className={
          current
            ? "absolute inset-0 bg-black/30"
            : "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]"
        }
      />

      {/* Overlaid absolutely so the text never adds height to (or distorts)
          the aspect-ratio box above — the section's size is driven purely
          by the image, not by its content. */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-dark uppercase">
            Welcome to
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-bold tracking-tight uppercase sm:text-6xl">
            {siteName}
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-dark">
            {current?.caption || tagline}
          </p>
          <Link
            href="#booking"
            className="mt-10 inline-block bg-accent px-6 py-3 text-xs font-semibold tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            {siteConfig.bookingCta}
          </Link>

          {slides.length > 1 && (
            <div className="mt-10 flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === index ? "bg-foreground-dark" : "bg-border-dark"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
