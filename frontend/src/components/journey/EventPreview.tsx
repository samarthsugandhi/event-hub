'use client';

import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { Event } from '@/types';

type EventPreviewProps = {
  events: Event[];
};

const angleByIndex = ['-4deg', '2deg', '-1deg'];
const offsetByIndex = [0, 18, 36];

export default function EventPreview({ events }: EventPreviewProps) {
  const visibleEvents = events.slice(0, 3);

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_80px_rgba(17,24,39,0.06)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,62,70,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(214,199,161,0.14),transparent_38%)]" />
      <div className="relative z-10 grid gap-5 lg:grid-cols-3">
        {visibleEvents.map((event, index) => (
          <motion.article
            key={event._id}
            initial={{ opacity: 0, y: 22, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
            whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
            style={{ y: offsetByIndex[index] ?? 0, rotate: angleByIndex[index] ?? '0deg' }}
            className="relative min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-[#E5E7EB] bg-[#FAFAF9] p-5 shadow-[0_18px_55px_rgba(17,24,39,0.05)]"
          >
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-4 top-4 h-24 w-24 rounded-full bg-[#2F3E46]/8 blur-2xl" />
              <div className="absolute right-0 top-10 h-28 w-28 rounded-full bg-[#D6C7A1]/18 blur-2xl" />
              <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-[#6B4F4F]/8 blur-2xl" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                  <Sparkles className="h-4 w-4 text-[#D6C7A1]" />
                  {event.category}
                </div>
                <h3 className="mt-5 text-2xl font-semibold leading-tight text-[#111827]">{event.title}</h3>
                <p className="mt-3 max-h-32 overflow-hidden text-sm leading-7 text-[#4B5563]">{event.description}</p>
              </div>

              <div className="rounded-[1.35rem] border border-[#E5E7EB] bg-white/90 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 text-sm text-[#4B5563]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#2F3E46]" />
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <span className="rounded-full bg-[#F1F1EF] px-3 py-1 text-xs font-medium text-[#4B5563]">
                    {event.isLive ? 'Live now' : event.featured ? 'Featured' : 'Journey stop'}
                  </span>
                </div>
                <div className="mt-3 flex items-start gap-2 text-sm text-[#4B5563]">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6B4F4F]" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}