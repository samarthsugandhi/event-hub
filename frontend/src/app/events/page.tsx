'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Event, EventCategory, CATEGORY_LABELS } from '@/types';
import SearchBar from '@/components/ui/SearchBar';
import EventGrid from '@/components/events/EventGrid';
import { ApiError } from '@/components/ui/ErrorBoundary';
import { Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories: (EventCategory | 'all')[] = [
  'all', 'technical', 'workshop', 'cultural', 'sports', 'seminar', 'hackathon', 'webinar', 'conference',
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEvents();
  }, [category, search, page]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: '12' };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const res = await api.events.list(params);
      setEvents(res.data);
      setTotalPages(res.pagination.pages);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-[-0.02em]">All Events</h1>
        <p className="text-[#B0B0B0]">Browse and discover events happening on campus</p>
      </div>

      {/* Search */}
      <SearchBar onSearch={(q) => { setSearch(q); setPage(1); }} />

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              category === cat
                ? 'bg-[#8B1E2D] text-white shadow-lg shadow-black/25'
                : 'glass text-[#B0B0B0] hover:text-white hover:bg-white/10'
            )}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#8B1E2D] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <ApiError message={error} onRetry={loadEvents} />
      ) : (
        <EventGrid
          events={events}
          emptyMessage="No events found. Try a different category or search term."
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && !error && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                p === page
                  ? 'bg-[#8B1E2D] text-white'
                  : 'glass text-[#B0B0B0] hover:text-white'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
