'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/api';
import { Event } from '@/types';
import SearchBar from '@/components/ui/SearchBar';
import FeaturedBanner from '@/components/events/FeaturedBanner';
import EventGrid from '@/components/events/EventGrid';
import EventCard from '@/components/events/EventCard';
import { Zap, TrendingUp, Clock, Radio, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Space_Grotesk, Manrope } from 'next/font/google';

const headlineFont = Space_Grotesk({ subsets: ['latin'], weight: ['600', '700'] });
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Event[]>([]);
  const [trending, setTrending] = useState<Event[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [live, setLive] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-badge], [data-hero-title], [data-hero-copy], [data-hero-search], [data-hero-stats]',
        { autoAlpha: 0, y: 28, filter: 'blur(10px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 40, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      gsap.to('[data-float-orb]', {
        y: -18,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 1,
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, featured.length, trending.length, upcoming.length, live.length, searchResults?.length]);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        api.events.featured(),
        api.events.trending(),
        api.events.upcoming(),
        api.events.live(),
      ]);

      // Gracefully handle partial failures — show whatever data loaded
      if (results[0].status === 'fulfilled') setFeatured(results[0].value.data);
      if (results[1].status === 'fulfilled') setTrending(results[1].value.data);
      if (results[2].status === 'fulfilled') setUpcoming(results[2].value.data);
      if (results[3].status === 'fulfilled') setLive(results[3].value.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.events.list({ search: query });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className={`${bodyFont.className} space-y-16`}>
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div data-float-orb className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[#0ea5e9]/18 blur-3xl" />
          <div data-float-orb className="absolute top-12 right-0 h-80 w-80 rounded-full bg-[#8b5cf6]/18 blur-3xl" />
          <div data-float-orb className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#22d3ee]/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div data-hero-badge className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 bg-black/20 backdrop-blur-xl border-[#38bdf8]/35 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
              <Zap className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-sm font-medium text-[#99f6e4] tracking-wide">
                BEC Event Hub
              </span>
            </div>
            <h1 data-hero-title className={`${headlineFont.className} text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight`}>
              Discover What&apos;s
              <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-[#38bdf8] via-[#a78bfa] to-[#c084fc]"> Happening</span>
            </h1>
            <p data-hero-copy className="text-slate-300 max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
              Your centralized platform for event discovery, registration, and participation
              at Basaveshwar Engineering College, Bagalkote.
            </p>
            <div data-hero-search>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick stats */}
            <div data-hero-stats className="flex items-center justify-center gap-8 mt-8 stagger-children">
              {[
                { label: 'Active Events', value: upcoming.length + live.length, icon: Calendar },
                { label: 'Live Now', value: live.length, icon: Radio },
                { label: 'Trending', value: trending.length, icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm rounded-full border border-white/10 px-3 py-1.5 bg-white/[0.03] backdrop-blur-sm">
                  <stat.icon className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-white font-semibold">{stat.value}</span>
                  <span className="text-slate-400 hidden sm:inline">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Search Results */}
        {searchResults && (
          <section data-reveal>
            <EventGrid
              events={searchResults}
              title={`Search Results (${searchResults.length})`}
              emptyMessage="No events match your search"
            />
          </section>
        )}

        {!searchResults && (
          <>
            {/* Featured Banner */}
            {featured.length > 0 && (
              <section data-reveal>
                <FeaturedBanner events={featured} />
              </section>
            )}

            {/* Live Events */}
            {live.length > 0 && (
              <section data-reveal>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Radio className="w-5 h-5 text-[#fb7185]" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <h2 className={`${headlineFont.className} text-2xl font-bold text-white`}>Happening Now</h2>
                    <span className="badge-live text-xs">LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {live.map((event) => (
                    <div key={event._id} className="relative group">
                      <div className="absolute -inset-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl opacity-30 group-hover:opacity-50 blur-sm transition-opacity" />
                      <div className="relative">
                        <EventCard event={event} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Events */}
            {trending.length > 0 && (
              <section data-reveal>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
                    <h2 className={`${headlineFont.className} text-2xl font-bold text-white`}>Trending Events</h2>
                  </div>
                  <Link href="/events" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trending.slice(0, 4).map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Events */}
            {upcoming.length > 0 && (
              <section data-reveal>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#60a5fa]" />
                    <h2 className={`${headlineFont.className} text-2xl font-bold text-white`}>Upcoming Events</h2>
                  </div>
                  <Link href="/events" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {upcoming.slice(0, 8).map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section data-reveal>
              <div className="glass-card text-center py-14 relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/10 via-[#8b5cf6]/10 to-[#c084fc]/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8b5cf6]/12 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <Sparkles className="w-8 h-8 text-[#38bdf8] mx-auto mb-4" />
                  <h2 className={`${headlineFont.className} text-2xl sm:text-3xl font-bold text-white mb-3`}>
                    Want to organize an event?
                  </h2>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Submit your event proposal and reach the entire BEC campus community.
                  </p>
                  <Link href="/organizer/submit" className="btn-primary inline-flex items-center gap-2">
                    Submit Event Proposal <Zap className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
