'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useRef } from 'react';

type HeroSceneProps = {
  liveCount: number;
  upcomingCount: number;
  featuredCount: number;
};

export default function HeroScene({ liveCount, upcomingCount, featuredCount }: HeroSceneProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const floatY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rightOrbY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const bottomOrbY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#FAFAF9] px-6 py-16 shadow-[0_30px_100px_rgba(17,24,39,0.06)] sm:px-10 lg:px-14 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: floatY }}
          className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-[#F1F1EF]/70 blur-3xl"
        />
        <motion.div
          style={{ y: rightOrbY }}
          className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#2F3E46]/10 blur-3xl"
        />
        <motion.div
          style={{ y: bottomOrbY }}
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#6B4F4F]/8 blur-3xl"
        />
      </div>

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <motion.div
          style={{ y: titleY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 px-4 py-2 text-sm text-[#4B5563] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#5F7161]" />
            Event Journey Experience Layer
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#9CA3AF]">Every Event Has a Story</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#111827] sm:text-6xl lg:text-7xl">
            Welcome to BEC Event Hub
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#4B5563] sm:text-lg">
            A cinematic campus journey that guides students from discovery to registration,
            QR check-in, and impact tracking — all inside the same event platform.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#2F3E46] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(17,24,39,0.10)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#233036]"
            >
              Explore Events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/85 px-6 py-3 text-sm font-medium text-[#111827] shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#D6C7A1]"
            >
              View Campus Map <MapPin className="h-4 w-4 text-[#6B4F4F]" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/70 to-[#e7e0d6]/75 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white/92 p-6 shadow-[0_24px_70px_rgba(17,24,39,0.06)] backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4 text-sm text-[#4B5563]">
              {[
                { label: 'Featured stories', value: featuredCount },
                { label: 'Live experiences', value: liveCount },
                { label: 'Upcoming chapters', value: upcomingCount },
                { label: 'Campus routes', value: 5 },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#E5E7EB] bg-[#F1F1EF] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[#111827]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF9] p-5">
              <p className="text-sm font-medium text-[#111827]">Storyline</p>
              <p className="mt-2 max-w-sm text-sm leading-7 text-[#4B5563]">
                From the first glance to the final check-in, every section points users toward the
                right route — events, registration, QR passes, map context, and campus insight.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}