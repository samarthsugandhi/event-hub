'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, ScanLine, Ticket } from 'lucide-react';

const qrCells = [
  [1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0],
  [1, 1, 1, 0, 1, 1, 1],
  [0, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 1, 1],
];

export default function QRVisual() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2F3E46]">
          <QrCode className="h-4 w-4" />
          QR experience
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-[#111827]">Registration becomes a pass you can feel.</h3>
        <p className="mt-4 text-sm leading-7 text-[#4B5563]">
          The QR journey is visualized here as a soft ticket layer — the same registration flow
          already in your system, presented as a memorable step in the story.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-full bg-[#2F3E46] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_34px_rgba(17,24,39,0.10)] transition-transform hover:-translate-y-0.5 hover:bg-[#233036]">
            Start registration
          </Link>
          <Link href="/admin/scanner" className="rounded-full border border-[#E5E7EB] bg-white/85 px-5 py-3 text-sm font-medium text-[#111827] transition-transform hover:-translate-y-0.5 hover:border-[#D6C7A1]">
            Open scanner
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#FAFAF9] p-6 shadow-[0_20px_60px_rgba(17,24,39,0.05)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,62,70,0.06),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(214,199,161,0.14),transparent_35%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between text-sm text-[#4B5563]">
              <div className="flex items-center gap-2 font-medium text-[#111827]">
                <Ticket className="h-4 w-4 text-[#5F7161]" />
                Digital pass
              </div>
              <span className="rounded-full bg-[#F1F1EF] px-3 py-1 text-xs font-medium text-[#4B5563]">Generated</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid w-[10rem] grid-cols-7 gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-inner">
                {qrCells.flatMap((row, rowIndex) =>
                  row.map((cell, columnIndex) => (
                    <motion.span
                      key={`${rowIndex}-${columnIndex}`}
                      animate={{ opacity: cell ? [0.5, 1, 0.75] : 0.12, scale: cell ? [0.95, 1, 0.96] : 1 }}
                      transition={{ duration: 3, repeat: Infinity, delay: (rowIndex + columnIndex) * 0.05, ease: 'easeInOut' }}
                      className={`aspect-square rounded-[0.2rem] ${cell ? 'bg-[#2F3E46]' : 'bg-transparent'}`}
                    />
                  ))
                )}
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.28em] text-[#9CA3AF]">Scan flow</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">Ticket → QR → Check-in</p>
                <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                  A scanning line glides through the pass to echo the existing verification system.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-full min-h-[16rem] rounded-[1.75rem] border border-[#E5E7EB] bg-[#FAFAF9] p-5">
            <motion.div
              animate={{ y: [0, 120, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-5 right-5 top-5 h-1 rounded-full bg-[#D6C7A1] shadow-[0_0_18px_rgba(214,199,161,0.32)]"
            />
            <div className="flex h-full items-end justify-between gap-3 pb-2 pt-12">
              {['Register', 'Generate', 'Scan', 'Admit'].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div className={`w-full rounded-[1.25rem] ${index === 0 ? 'h-24 bg-white' : index === 1 ? 'h-32 bg-[#F1F1EF]' : index === 2 ? 'h-28 bg-white' : 'h-36 bg-[#F1F1EF]'} border border-[#E5E7EB] shadow-sm`} />
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#4B5563]">{step}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#4B5563]">
              <ScanLine className="h-4 w-4 text-[#6B4F4F]" />
              Existing QR registration and verification journey, reframed visually.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}