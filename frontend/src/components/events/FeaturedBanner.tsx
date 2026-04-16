'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, CATEGORY_LABELS } from '@/types';
import { formatDate, getCategoryBg, isEventLive } from '@/lib/utils';
import dynamic from 'next/dynamic';

const AnimatedBackground = dynamic(
  () => import('@/components/three/AnimatedBackground'),
  { ssr: false }
);

interface FeaturedBannerProps {
  events: Event[];
}

export default function FeaturedBanner({ events }: FeaturedBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (!events.length) return null;

  const event = events[current];
  const live = isEventLive(event.date, event.endDate);

  return (
    <div className="relative h-[420px] rounded-3xl overflow-hidden glass border border-white/[0.08]">
      {/* Three.js Background */}
      <AnimatedBackground className="opacity-40" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#040816]/92 via-[#071123]/65 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center p-8 md:p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
              {CATEGORY_LABELS[event.category]}
            </span>
            {live && (
                <span className="badge-live text-xs shadow-[0_0_22px_rgba(248,113,113,0.18)]">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse" />
                LIVE NOW
              </span>
            )}
            {event.featured && (
              <span className="badge bg-cyan-500/15 text-cyan-200 border-cyan-400/30 text-xs">
                ⭐ Featured
              </span>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {event.title}
          </h2>

          <p className="text-gray-400 text-sm mb-6 line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
            <span>📅 {formatDate(event.date)}</span>
            <span>📍 {event.venue}</span>
            <span>👥 {event.registrationCount}/{event.maxParticipants}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/events/${event._id}`} className="btn-primary flex items-center gap-2">
              View Event <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={`/register/${event._id}`} className="btn-secondary">
              Register Now
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      {events.length > 1 && (
        <div className="absolute bottom-6 right-8 flex items-center gap-3 z-10">
          <button
            onClick={() => setCurrent((c) => (c - 1 + events.length) % events.length)}
            className="p-1.5 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-primary-400 w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % events.length)}
            className="p-1.5 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
