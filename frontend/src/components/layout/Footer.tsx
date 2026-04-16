import { Zap, MapPin, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-0" style={{ background: 'rgba(10, 10, 10, 0.92)' }}>
      <div className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grain-overlay absolute inset-x-0 pointer-events-none h-full opacity-15" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] flex items-center justify-center shadow-lg shadow-black/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">BEC Event Hub</span>
            </div>
            <p className="text-[#B0B0B0] text-sm max-w-md leading-relaxed mb-4">
              The centralized event discovery, registration, and attendance management platform
              for Basaveshwar Engineering College, Bagalkote. Your campus, your events.
            </p>
            <div className="flex items-start gap-2 text-sm text-[#9a9a9a]">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>5MC5+WV4, Vidayagiri, Bagalkote, Karnataka 587103</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-[#B0B0B0]">
              <li><Link href="/events" className="hover:text-[#C6A75E] transition-colors">Browse Events</Link></li>
              <li><Link href="/map" className="hover:text-[#C6A75E] transition-colors">Campus Map</Link></li>
              <li><Link href="/organizer/submit" className="hover:text-[#C6A75E] transition-colors">Submit Event</Link></li>
              <li><Link href="/notifications" className="hover:text-[#C6A75E] transition-colors">Notifications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2.5 text-sm text-[#B0B0B0]">
              <li>
                <a href="https://wave3-0.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C6A75E] transition-colors flex items-center gap-1">
                  WAVE Hackathon 3.0 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><a href="#" className="hover:text-[#C6A75E] transition-colors">Help Center</a></li>
              <li>
                <a href="mailto:admin@becbgk.edu" className="hover:text-[#C6A75E] transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact Us
                </a>
              </li>
              <li><a href="#" className="hover:text-[#C6A75E] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8d8d8d]">
            © {new Date().getFullYear()} BEC Event Hub • Basaveshwar Engineering College, Bagalkote
          </p>
          <p className="text-xs text-[#7a7a7a]">
            Built with ❤️ for BEC Campus
          </p>
        </div>
      </div>
    </footer>
  );
}
