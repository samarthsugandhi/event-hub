'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, QrCode, TrendingUp } from 'lucide-react';
import { Event } from '@/types';

type EditorialFlowProps = {
  featured: Event[];
  trending: Event[];
  upcoming: Event[];
  live: Event[];
  canViewAnalytics: boolean;
};

const chapterShell = 'rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8';

function ChapterTitle({ number, title, eyebrow }: { number: string; title: string; eyebrow: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.38em] text-[#C6A75E]">{eyebrow}</p>
      <div className="mt-4 flex items-end gap-4">
        <span className="text-5xl font-semibold tracking-[-0.08em] text-[#B0B0B0]">{number}</span>
        <h2 className="max-w-xl text-3xl font-semibold uppercase tracking-[-0.04em] text-[#F5F5F5] sm:text-5xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function StatsRibbon({ live, upcoming, trending, featured }: { live: number; upcoming: number; trending: number; featured: number }) {
  const items = [
    { label: 'live', value: live },
    { label: 'upcoming', value: upcoming },
    { label: 'trending', value: trending },
    { label: 'featured', value: featured },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B0B0B0]">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-[#F5F5F5]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function EditorialVisual({
  title,
  caption,
  accent = 'gold',
}: {
  title: string;
  caption: string;
  accent?: 'gold' | 'red' | 'green';
}) {
  const accentMap = {
    gold: 'bg-[#C6A75E]/18 border-[#C6A75E]/35',
    red: 'bg-[#8B1E2D]/18 border-[#8B1E2D]/35',
    green: 'bg-[#5B6E5D]/18 border-[#5B6E5D]/35',
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
      <div className={`h-2 w-28 rounded-full border ${accentMap[accent]}`} />
      <div className="mt-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#B0B0B0]">visual cue</p>
        <h3 className="text-3xl font-semibold tracking-[-0.04em] text-[#F5F5F5]">{title}</h3>
        <p className="max-w-md text-sm leading-7 text-[#B0B0B0]">{caption}</p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            animate={{ scale: [1, 1.03, 1], opacity: [0.8, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, delay: item * 0.15, ease: 'easeInOut' }}
            className={`aspect-[4/5] rounded-[1.35rem] border ${accentMap[accent]}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function EditorialFlow({ featured, trending, upcoming, live, canViewAnalytics }: EditorialFlowProps) {
  const topFeature = featured[0] || trending[0] || upcoming[0] || live[0];
  const topLive = live[0] || trending[0] || upcoming[0] || featured[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className={chapterShell}
          >
            <ChapterTitle number="01" title="What you need" eyebrow="quick overview" />
            <div className="mt-8 space-y-6">
              <p className="max-w-3xl text-base leading-7 text-[#D0D0D0] sm:text-lg">
                Find events, register fast, and use your QR pass at entry. Everything important is one click away.
              </p>
              <StatsRibbon
                live={live.length}
                upcoming={upcoming.length}
                trending={trending.length}
                featured={featured.length}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#731723]">
                  Browse events <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/map" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-medium text-[#F5F5F5] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#C6A75E]/40">
                  Campus map <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className={chapterShell}
          >
            <ChapterTitle number="02" title="Featured now" eyebrow="top pick" />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-[#F5F5F5] [overflow-wrap:anywhere]">
                  {topFeature?.title || 'A new issue begins'}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#D0D0D0]">
                  {topFeature?.description || 'Discover the highlighted event and move directly into registration from the events page.'}
                </p>
                <Link href="/events" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F5] underline decoration-[#C6A75E] decoration-2 underline-offset-8 transition-transform hover:-translate-y-0.5">
                  Open events <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <EditorialVisual
                title={topLive?.title || 'Live spotlight'}
                caption={topLive?.venue || 'Track live and upcoming moments from one clean dashboard.'}
                accent="red"
              />
            </div>
          </motion.section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)]"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-[#B0B0B0]">live note</p>
            <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[-0.02em] text-[#F5F5F5] [overflow-wrap:anywhere]">
              {topLive?.title || 'The next moment is already underway.'}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#D0D0D0]">
              {topLive?.venue || 'The feed below keeps one eye on live moments and one on what is about to unfold.'}
            </p>
          </motion.div>

          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-[#B0B0B0]">quick links</p>
            <div className="mt-5 space-y-3">
              {[
                { href: '/events', label: 'Open events' },
                ...(canViewAnalytics ? [{ href: '/admin/analytics', label: 'View analytics' }] : []),
                { href: '/map', label: 'See campus map' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-sm text-[#F5F5F5] transition-all duration-300 hover:border-[#C6A75E]/40 hover:bg-white/[0.05]"
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-[#C6A75E]" />
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#D0D0D0]">
              <QrCode className="h-4 w-4 text-[#C6A75E]" />
              QR pass is generated after successful registration.
            </div>
          </div>

          {canViewAnalytics && (
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F5] underline decoration-[#C6A75E] decoration-2 underline-offset-8 transition-transform hover:-translate-y-0.5"
            >
              Platform insights <TrendingUp className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}