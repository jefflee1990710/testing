"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Optional copy for the landing hero. Defaults suit a personal engineering blog.
 */
export interface BlogHeroProps {
  /** Small label above the headline, e.g. role or site tagline */
  eyebrow?: string;
  /** Primary hero heading */
  title: string;
  /** Supporting line under the title */
  subtitle: string;
  /** Primary CTA anchor href */
  ctaHref?: string;
  /** Primary CTA label */
  ctaLabel?: string;
  /** Optional second link (e.g. newsletter or featured post) */
  secondaryCta?: { href: string; label: string };
}

// Purpose: Staggered reveal timings for hero children.
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

/**
 * BlogHero
 *
 * Personal-blog hero with Framer Motion entrance animations and a vivid gradient
 * frame so the landing feels warm and energetic without heavy shadows.
 */
export default function BlogHero({
  eyebrow = "Personal blog",
  title,
  subtitle,
  ctaHref = "#posts",
  ctaLabel = "Latest posts",
  secondaryCta,
}: BlogHeroProps) {
  return (
    <motion.header
      className="relative mb-16 overflow-hidden rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-100/90 via-white to-amber-50/90 p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:mb-20 sm:p-10 sm:text-left lg:p-12"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div
        className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-fuchsia-400/35 blur-3xl"
        aria-hidden
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" as const }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl"
        aria-hidden
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl sm:left-2/3"
        aria-hidden
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
      />

      <div className="relative z-10">
        <motion.p
          variants={item}
          className="mb-4 inline-block rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm shadow-fuchsia-500/25"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          variants={item}
          className="bg-gradient-to-r from-violet-800 via-fuchsia-700 to-orange-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-violet-950/80 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-4 sm:justify-start">
          <motion.a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/30 transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {ctaLabel}
          </motion.a>
          {secondaryCta ? (
            <motion.a
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-violet-300/80 bg-white/70 px-6 py-3 text-sm font-semibold text-violet-900 backdrop-blur-sm transition-colors hover:border-fuchsia-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {secondaryCta.label}
            </motion.a>
          ) : null}
          <motion.button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Hello!')}
          >
            Fake Button
          </motion.button>
        </motion.div>

        <motion.div
          variants={item}
          className="mx-auto mt-12 h-1.5 w-full max-w-md rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 opacity-90 sm:mx-0"
          aria-hidden
        />
      </div>
    </motion.header>
  );
}
