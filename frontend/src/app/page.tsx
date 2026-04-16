'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Event } from '@/types';
import { useAuth } from '@/lib/auth';
import MagazineHero from '@/components/editorial/MagazineHero';
import EditorialFlow from '@/components/editorial/EditorialFlow';
import { ArrowRight, Flame, MapPin, Clock } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [featured, setFeatured] = useState<Event[]>([]);
  const [trending, setTrending] = useState<Event[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [live, setLive] = useState<Event[]>([]);
  const [canViewAnalytics, setCanViewAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAnalyticsAccess = async () => {
      if (authLoading) return;

      if (!user) {
        if (!cancelled) setCanViewAnalytics(false);
        return;
      }

      if (user.role === 'admin') {
        if (!cancelled) setCanViewAnalytics(true);
        return;
      }

      try {
        const res = await api.events.my();
        const myEvents: Event[] = res.data || [];
        const hasApprovedEvent = myEvents.some((event) =>
          ['approved', 'published', 'completed'].includes(event.status)
        );

        if (!cancelled) setCanViewAnalytics(hasApprovedEvent);
      } catch {
        if (!cancelled) setCanViewAnalytics(false);
      }
    };

    checkAnalyticsAccess();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="h-14 w-14 rounded-full border-2 border-[#8B1E2D] border-t-transparent animate-spin" />
          <p className="text-sm text-[#B0B0B0]">Setting the issue...</p>
        </div>
      </div>
    );
  }

  const spotlight = featured[0] || trending[0] || upcoming[0] || live[0];

  return (
    <main className="bg-[#0A0A0A] text-[#F5F5F5]">
      <MagazineHero
        featuredCount={featured.length}
        liveCount={live.length}
        upcomingCount={upcoming.length}
        spotlightTitle={spotlight?.title}
        spotlightVenue={spotlight?.venue}
      />
      <EditorialFlow
        featured={featured}
        trending={trending}
        upcoming={upcoming}
        live={live}
        canViewAnalytics={canViewAnalytics}
      />

      <section className="mx-auto max-w-7xl border-t border-white/[0.08] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#C6A75E]">live now</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#F5F5F5]">Events running presently</h2>
              <p className="mt-2 text-sm text-[#CFCFCF]">See what is happening on campus right now.</p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-medium text-[#F5F5F5] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#C6A75E]/40"
            >
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {live.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {live.slice(0, 6).map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B1E2D]/45 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1E2D]/35 bg-[#8B1E2D]/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F5F5F5]">
                      <Flame className="h-3.5 w-3.5" /> Live
                    </span>
                    <span className="text-xs text-[#AFAFAF]">{event.registrationCount}/{event.maxParticipants} joined</span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold leading-7 text-[#F5F5F5] [overflow-wrap:anywhere]">
                    {event.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-[#CFCFCF]">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#C6A75E]" /> {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                    </p>
                    <p className="flex items-center gap-2 [overflow-wrap:anywhere]">
                      <MapPin className="h-4 w-4 text-[#C6A75E]" /> {event.venue}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
              <p className="text-base text-[#D0D0D0]">No live events right now.</p>
              <p className="mt-1 text-sm text-[#AFAFAF]">Check upcoming events and register early.</p>
              <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#F5F5F5] underline decoration-[#C6A75E] decoration-2 underline-offset-8">
                Browse upcoming <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
