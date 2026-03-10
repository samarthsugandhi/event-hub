'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/types';
import SearchBar from '@/components/ui/SearchBar';
import FeaturedBanner from '@/components/events/FeaturedBanner';
import EventGrid from '@/components/events/EventGrid';
import EventCard from '@/components/events/EventCard';
import { Zap, TrendingUp, Clock, Radio, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [featured, setFeatured] = useState<Event[]>([]);
  const [trending, setTrending] = useState<Event[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [live, setLive] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary-500/20 mb-6">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300 tracking-wide">
                BEC Vortex Event Hub
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Discover What&apos;s
              <span className="gradient-text block sm:inline"> Happening</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
              Your centralized platform for event discovery, registration, and participation
              at Basaveshwar Engineering College, Bagalkote.
            </p>
            <SearchBar onSearch={handleSearch} />

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-8 stagger-children">
              {[
                { label: 'Active Events', value: upcoming.length + live.length, icon: Calendar },
                { label: 'Live Now', value: live.length, icon: Radio },
                { label: 'Trending', value: trending.length, icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm">
                  <stat.icon className="w-4 h-4 text-primary-400" />
                  <span className="text-white font-semibold">{stat.value}</span>
                  <span className="text-gray-500 hidden sm:inline">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Search Results */}
        {searchResults && (
          <section className="animate-fade-in">
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
              <section className="animate-fade-in">
                <FeaturedBanner events={featured} />
              </section>
            )}

            {/* Live Events */}
            {live.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Radio className="w-5 h-5 text-red-400" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Happening Now</h2>
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
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <h2 className="text-2xl font-bold text-white">Trending Events</h2>
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
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-400" />
                    <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
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
            <section className="animate-fade-in">
              <div className="glass-card text-center py-14 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-purple-600/10 to-primary-600/5" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Want to organize an event?
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
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
