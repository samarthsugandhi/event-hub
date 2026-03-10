'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Event, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatDate, getCategoryBg } from '@/lib/utils';
import { MapPin, List, Map as MapIcon, Clock, Users, IndianRupee, AlertCircle, UsersRound } from 'lucide-react';

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

  // Default center — BEC Bagalkote campus
  const center: [number, number] = eventsWithCoords.length > 0
    ? [eventsWithCoords[0].locationCoordinates!.lat, eventsWithCoords[0].locationCoordinates!.lng]
    : [16.1834, 75.6551];

  const activeCategories = Array.from(new Set(eventsWithCoords.map((e) => e.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary-400" /> Campus Event Map
          </h1>
          <p className="text-gray-400 mt-1">
            Discover events across the BEC Bagalkote campus
            {eventsWithCoords.length > 0 && (
              <span className="text-gray-500 ml-2">• {eventsWithCoords.length} locations pinned</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('map')}
            className={`p-2.5 rounded-lg transition-colors ${
              view === 'map' ? 'bg-primary-500/20 text-primary-300' : 'text-gray-500 hover:text-gray-300'
            }`}
            title="Map View"
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2.5 rounded-lg transition-colors ${
              view === 'list' ? 'bg-primary-500/20 text-primary-300' : 'text-gray-500 hover:text-gray-300'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {['all', ...Object.keys(CATEGORY_LABELS)].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedCategory === cat
                ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                : 'border-white/10 text-gray-400 hover:border-white/20'
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
        <div className="space-y-4">
          <div className="glass rounded-2xl overflow-hidden relative" style={{ height: '70vh' }}>
            <MapView events={filtered} center={center} />

            {eventsWithCoords.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#05050f]/80 z-[1000]">
                <div className="text-center">
                  <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No events with map coordinates found.</p>
                  <p className="text-sm text-gray-600 mt-1">Events need coordinates to appear on the map.</p>
                </div>
              </div>
            )}
          </div>

          {/* Map Legend */}
          {activeCategories.length > 0 && (
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">MAP LEGEND</p>
              <div className="flex flex-wrap gap-3">
                {activeCategories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-400">
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
      ) : (
        /* List View */
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No events found</p>
            </div>
          ) : (
            filtered.map((event) => {
              const isFull = event.registrationCount >= event.maxParticipants;
              const isPastDeadline = new Date() > new Date(event.registrationDeadline);
              return (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="glass-card flex items-center gap-5 group hover:bg-white/[0.04] transition-all"
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
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
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
