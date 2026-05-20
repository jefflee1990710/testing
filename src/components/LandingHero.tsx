import React from "react";
import Link from "next/link";
import HeroThreeAnimation from "@/src/components/HeroThreeAnimation";

/**
 * LandingHero
 *
 * Primary hero for the home page: name, role, and experience with a blue–green
 * palette (gradient backdrop and accents).
 */
export interface LandingHeroProps {
  /** Display name shown as the main heading */
  name: string;
  /** One-line professional summary (role and tenure) */
  summary: string;
}

export default function LandingHero({ name, summary }: LandingHeroProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-emerald-200/60 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100"
      aria-labelledby="landing-hero-heading"
    >
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-72 w-72 rounded-full bg-sky-400/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-emerald-400/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-teal-300/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-12">
          <div>
            <p className="inline-flex items-center rounded-full border border-sky-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 shadow-sm backdrop-blur-sm">
              <span
                className="mr-2 h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                aria-hidden
              />
              Welcome
            </p>
            <h1
              id="landing-hero-heading"
              className="mt-5 bg-gradient-to-r from-blue-700 via-teal-600 to-emerald-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
            >
              {name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700 sm:text-xl">
              {summary}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get in touch
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-500/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-800 backdrop-blur-sm transition-colors hover:border-emerald-600 hover:bg-emerald-50/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                About
              </Link>
              <Link
                href="/new-page"
                className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-500/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-800 backdrop-blur-sm transition-colors hover:border-emerald-600 hover:bg-emerald-50/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                New page
              </Link>
            </div>

            <div
              className="mt-14 h-1.5 max-w-md rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 opacity-90"
              aria-hidden
            />
          </div>
          <HeroThreeAnimation />
        </div>
      </div>
    </section>
  );
}
