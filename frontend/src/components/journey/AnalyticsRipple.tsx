'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight, Layers3 } from 'lucide-react';

type AnalyticsRippleProps = {
  eventCount: number;
  registrationCount: number;
  liveCount: number;
};

export default function AnalyticsRipple({ eventCount, registrationCount, liveCount }: AnalyticsRippleProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2F3E46]">
          <BarChart3 className="h-4 w-4" />
          Analytics impact
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-[#111827]">Ripples of participation become campus insight.</h3>
        <p className="mt-4 text-sm leading-7 text-[#4B5563]">
          The admin view remains intact, while the landing page turns analytics into a calm ripple
          that suggests scale, momentum, and institutional impact.
        </p>
        <Link href="/admin" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F3E46] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_34px_rgba(17,24,39,0.10)] transition-transform hover:-translate-y-0.5 hover:bg-[#233036]">
          View admin dashboard <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#FAFAF9] p-6 shadow-[0_20px_60px_rgba(17,24,39,0.05)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(47,62,70,0.06),transparent_45%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 4.2, repeat: Infinity, delay: item * 0.5, ease: 'easeInOut' }}
              className="absolute aspect-square rounded-full border border-[#D6C7A1]/35"
              style={{ width: `${item * 7.5}rem` }}
            />
          ))}

          <div className="relative z-10 flex h-44 w-44 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-[0_20px_40px_rgba(17,24,39,0.06)]">
            <Layers3 className="h-10 w-10 text-[#2F3E46]" />
          </div>

          <div className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4">
            {[
              { label: 'Events', value: eventCount },
              { label: 'Registrations', value: registrationCount },
              { label: 'Live now', value: liveCount },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e2d9cf] bg-[#f8f5ef] p-4 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#111827]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}