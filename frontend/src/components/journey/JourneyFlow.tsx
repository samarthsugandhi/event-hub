'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Sparkles, Ticket, Waves } from 'lucide-react';
import { Event } from '@/types';
import EventPreview from './EventPreview';
import QRVisual from './QRVisual';
import AnalyticsRipple from './AnalyticsRipple';

type JourneyFlowProps = {
  featured: Event[];
  trending: Event[];
  upcoming: Event[];
  live: Event[];
};

const sectionStyle =
  'rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_80px_rgba(17,24,39,0.06)] sm:p-8';

export default function JourneyFlow({ featured, trending, upcoming, live }: JourneyFlowProps) {
  const seedEvents = [...featured, ...trending, ...upcoming, ...live];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className={sectionStyle}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#5F7161]">
              <Compass className="h-4 w-4" />
              Discovery
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
              The campus opens like a map of possibilities.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#4B5563] sm:text-base">
              Floating visual fragments suggest the scale of activity without falling back on
              standard cards. Users are invited to explore the event landscape first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-[#2F3E46] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-[#233036]">
                Explore events <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/map" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#111827] transition-transform hover:-translate-y-0.5 hover:border-[#D6C7A1]">
                Campus map
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Upcoming route', value: upcoming.length, tone: 'bg-[#F1F1EF] text-[#2F3E46]' },
              { title: 'Trending pulse', value: trending.length, tone: 'bg-[#F1F1EF] text-[#6B4F4F]' },
              { title: 'Featured highlights', value: featured.length, tone: 'bg-[#F1F1EF] text-[#5F7161]' },
              { title: 'Live moments', value: live.length, tone: 'bg-[#F1F1EF] text-[#111827]' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                className="rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF9] p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">{item.title}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-4xl font-semibold text-[#111827]">{item.value}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>{index + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className={sectionStyle}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[#6B4F4F]">
          <Sparkles className="h-4 w-4" />
          Decision
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
              Event previews move like a sequence, not a wall.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#4B5563] sm:text-base">
              We reuse the existing event data, but present it through layered motion and soft depth
              so the next action feels natural.
            </p>
            <Link href="/events" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#111827] transition-transform hover:-translate-y-0.5 hover:border-[#D6C7A1]">
              Browse the full archive <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <EventPreview events={seedEvents} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className={sectionStyle}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[#2F3E46]">
          <Ticket className="h-4 w-4" />
          Participation
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
              Registration feels like stepping into the story.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#4B5563] sm:text-base">
              The CTA leads directly into the existing registration flow, while the illustration
              frames it as a warm, intentional action.
            </p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F3E46] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-[#233036]">
              Register for an event <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] border border-[#E5E7EB] bg-[#F1F1EF] p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {['Choose', 'Confirm', 'Attend'].map((step, index) => (
                <div key={step} className="rounded-[1.25rem] border border-[#E5E7EB] bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">Step {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">{step}</p>
                  <div className="mt-4 h-24 rounded-[1rem] bg-[linear-gradient(180deg,rgba(214,199,161,0.16),rgba(241,241,239,0.7))]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className={sectionStyle}
      >
        <QRVisual />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className={sectionStyle}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[#5F7161]">
          <Waves className="h-4 w-4" />
          Analytics impact
        </div>
        <div className="mt-4">
          <AnalyticsRipple
            eventCount={featured.length + trending.length + upcoming.length + live.length}
            registrationCount={seedEvents.reduce((sum, event) => sum + event.registrationCount, 0)}
            liveCount={live.length}
          />
        </div>
      </motion.section>
    </div>
  );
}