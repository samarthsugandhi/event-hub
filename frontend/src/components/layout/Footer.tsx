import { Zap, MapPin, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20" style={{ background: 'rgba(5, 5, 15, 0.9)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">BEC Vortex</span>
            </div>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-4">
              The centralized event discovery, registration, and attendance management platform
              for Basaveshwar Engineering College, Bagalkote. Your campus, your events.
            </p>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>5MC5+WV4, Vidayagiri, Bagalkote, Karnataka 587103</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/events" className="hover:text-primary-400 transition-colors">Browse Events</Link></li>
              <li><Link href="/map" className="hover:text-primary-400 transition-colors">Campus Map</Link></li>
              <li><Link href="/organizer/submit" className="hover:text-primary-400 transition-colors">Submit Event</Link></li>
              <li><Link href="/notifications" className="hover:text-primary-400 transition-colors">Notifications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <a href="https://wave3-0.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  WAVE Hackathon 3.0 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li>
                <a href="mailto:admin@becbgk.edu" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact Us
                </a>
              </li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} BEC Vortex Event Hub • Basaveshwar Engineering College, Bagalkote
          </p>
          <p className="text-xs text-gray-700">
            Built with ❤️ for BEC Campus
          </p>
        </div>
      </div>
    </footer>
  );
}
