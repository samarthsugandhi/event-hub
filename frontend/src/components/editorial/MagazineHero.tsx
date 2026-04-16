'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

type MagazineHeroProps = {
  featuredCount: number;
  liveCount: number;
  upcomingCount: number;
  spotlightTitle?: string;
  spotlightVenue?: string;
};

export default function MagazineHero({
  featuredCount,
  liveCount,
  upcomingCount,
  spotlightTitle,
  spotlightVenue,
}: MagazineHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden border-b border-white/10 bg-[#0A0A0A] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-end gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <motion.div style={{ y: titleY }} className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#B0B0B0]">
            <Sparkles className="h-4 w-4 text-[#C6A75E]" />
            BEC Event Hub / editorial edition
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="mt-8 max-w-5xl text-[clamp(2.2rem,9vw,6.3rem)] font-semibold uppercase leading-[0.95] tracking-[-0.035em] text-[#F5F5F5] [overflow-wrap:anywhere]"
          >
            Events are not announced.
            <span className="block text-[#B0B0B0]">They are experienced.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
            className="mt-8 max-w-2xl text-base leading-7 text-[#CFCFCF] sm:text-lg"
          >
            Discover what is happening on campus now, what is coming next, and register in a few clicks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-6 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#731723]"
            >
              Explore events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-[#F5F5F5] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#C6A75E]/40"
            >
              View campus map
            </Link>
          </motion.div>
        </motion.div>

        <motion.aside
          style={{ y: panelY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative"
        >
          <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,94,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,30,45,0.14),transparent_32%)]" />

            <div className="relative z-10 flex min-h-[34rem] flex-col justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#B0B0B0]">Current issue</p>
                <div className="mt-5 space-y-3">
                  <p className="truncate text-2xl font-semibold tracking-tight text-[#F5F5F5]">
                    {spotlightTitle || 'Campus spotlight'}
                  </p>
                  <p className="max-w-sm truncate text-sm leading-7 text-[#D0D0D0]">
                    {spotlightVenue || 'Latest curated event from the campus lineup.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Featured', value: featuredCount },
                  { label: 'Live', value: liveCount },
                  { label: 'Upcoming', value: upcomingCount },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#B0B0B0]">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[#F5F5F5]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#C6A75E]">Quick note</p>
                <p className="mt-3 text-sm leading-7 text-[#D0D0D0]">
                  Pick an event, register, and show your pass at entry.
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}