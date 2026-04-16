'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Event, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatDate, getCategoryBg } from '@/lib/utils';
import { MapPin, List, Map as MapIcon, Clock, Users, IndianRupee, AlertCircle, UsersRound, Layers3, Sparkles, Compass, Flame, Pin } from 'lucide-react';

// Dynamic import the full map component (contains leaflet CSS + icon fixes)
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-dark-900/50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  ),
});

export default function CampusMapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.events.map();
      setEvents(res.data || []);
    } catch {
      try {
        const res = await api.events.list({ status: 'published' });
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCategory === 'all'
    ? events
    : events.filter((e) => e.category === selectedCategory);

  const eventsWithCoords = filtered.filter(
    (e) => e.locationCoordinates?.lat && e.locationCoordinates?.lng
  );

  const campusCenter: [number, number] = [16.1842, 75.6562];
  const mapCenter: [number, number] = eventsWithCoords.length > 0
    ? [
        eventsWithCoords.reduce((sum, event) => sum + event.locationCoordinates!.lat, 0) / eventsWithCoords.length,
        eventsWithCoords.reduce((sum, event) => sum + event.locationCoordinates!.lng, 0) / eventsWithCoords.length,
      ]
    : campusCenter;

  const activeCategories = Array.from(new Set(eventsWithCoords.map((e) => e.category)));
  const featuredPinned = eventsWithCoords.filter((event) => event.featured).slice(0, 3);
  const livePinned = eventsWithCoords.filter((event) => event.isLive).slice(0, 3);
  const totalRegistrations = eventsWithCoords.reduce((sum, event) => sum + event.registrationCount, 0);
  const highlightedCount = eventsWithCoords.filter((event) => event.featured || event.isTrending).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden glass-card aurora-border">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 text-xs font-semibold tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5" /> Campus Navigation
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                <MapPin className="w-8 h-8 text-cyan-300" /> Campus Event Map
              </h1>
              <p className="text-slate-300 mt-3 max-w-2xl leading-relaxed">
                Find event locations across BEC using a campus-first layout tuned for
                5MC5+WV4 and 5MC5+XHP, Vidayagiri, Bagalkote.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                <Pin className="w-4 h-4 text-cyan-300" /> {eventsWithCoords.length} pinned events
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                <Flame className="w-4 h-4 text-orange-300" /> {highlightedCount} highlighted
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                <Layers3 className="w-4 h-4 text-violet-300" /> {activeCategories.length} active categories
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start xl:self-auto">
            <button
              onClick={() => setView('map')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                view === 'map'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'glass text-slate-400 hover:text-white'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                view === 'list'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'glass text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>
        </div>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pinned', value: eventsWithCoords.length, icon: MapPin, tone: 'text-cyan-300' },
          { label: 'Registrations', value: totalRegistrations, icon: Users, tone: 'text-violet-300' },
          { label: 'Highlighted', value: highlightedCount, icon: Sparkles, tone: 'text-amber-300' },
          { label: 'Categories', value: activeCategories.length, icon: Layers3, tone: 'text-emerald-300' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card aurora-border flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl bg-white/[0.04] flex items-center justify-center ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {['all', ...Object.keys(CATEGORY_LABELS)].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedCategory === cat
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/10'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat !== 'all' && (
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }}
              />
            )}
            {cat === 'all' ? 'All Events' : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === 'map' ? (
        /* Map View */
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)] gap-6 items-start">
          <div className="space-y-4">
            <div className="glass rounded-3xl overflow-hidden relative aurora-border" style={{ minHeight: '72vh' }}>
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-5 pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-cyan-300" /> Centered on campus anchor
                </div>
                <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                  {eventsWithCoords.length} map pins
                </div>
              </div>

              <MapView events={filtered} center={mapCenter} />

              {eventsWithCoords.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#040816]/85 z-[1000] backdrop-blur-sm">
                  <div className="text-center max-w-sm px-6">
                    <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">No events with map coordinates found.</p>
                    <p className="text-sm text-slate-500 mt-1">Seeded events need campus coordinates to appear on the map.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            {activeCategories.length > 0 && (
              <div className="glass-card aurora-border">
                <p className="text-xs text-slate-500 mb-3 font-semibold tracking-[0.2em] uppercase">Map Legend</p>
                <div className="flex flex-wrap gap-3">
                  {activeCategories.map((cat) => (
                    <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-300 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <div className="glass-card aurora-border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Campus Highlights</h2>
              </div>
              <div className="space-y-3">
                {(featuredPinned.length > 0 ? featuredPinned : eventsWithCoords.slice(0, 3)).map((event) => (
                  <Link
                    key={event._id}
                    href={`/events/${event._id}`}
                    className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[event.category]}22, ${CATEGORY_COLORS[event.category]}44)` }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: CATEGORY_COLORS[event.category] }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{event.title}</p>
                        <p className="text-xs text-slate-400 mt-1 truncate">{event.venue}</p>
                        <span className={`badge ${getCategoryBg(event.category)} mt-2 text-[10px]`}>{CATEGORY_LABELS[event.category]}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {livePinned.length > 0 && (
              <div className="glass-card aurora-border">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <h2 className="text-lg font-semibold text-white">Live On Campus</h2>
                </div>
                <div className="space-y-3">
                  {livePinned.map((event) => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-slate-500 truncate">{event.venue}</p>
                      </div>
                      <span className="badge-live text-[10px]">LIVE</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card aurora-border">
              <h2 className="text-lg font-semibold text-white mb-3">Campus Anchor</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Events are now centered around the BEC campus cluster near 5MC5+WV4 / 5MC5+XHP.
                The map defaults to the average pin position for a tighter campus view.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        /* List View */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 md:col-span-2 xl:col-span-3 glass-card">
              <p className="text-slate-400">No events found</p>
            </div>
          ) : (
            filtered.map((event) => {
              const isFull = event.registrationCount >= event.maxParticipants;
              const isPastDeadline = new Date() > new Date(event.registrationDeadline);
              return (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="glass-card aurora-border flex items-center gap-5 group hover:bg-white/[0.04] transition-all"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${CATEGORY_COLORS[event.category]}22, ${CATEGORY_COLORS[event.category]}44)`,
                    }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: CATEGORY_COLORS[event.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium truncate">{event.title}</h3>
                      <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                      {isFull && (
                        <span className="badge bg-red-500/15 text-red-300 border-red-500/25 text-xs">Full</span>
                      )}
                      {!isFull && isPastDeadline && (
                        <span className="badge bg-orange-500/15 text-orange-300 border-orange-500/25 text-xs">Closed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(event.date)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registrationCount}/{event.maxParticipants}</span>
                      {event.pricingType === 'paid' && (
                        <span className="flex items-center gap-1 text-primary-400">
                          <IndianRupee className="w-3 h-3" /> ₹{event.price}
                        </span>
                      )}
                      {event.participationType === 'team' && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <UsersRound className="w-3 h-3" /> Team
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
