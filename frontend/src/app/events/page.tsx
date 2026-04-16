'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Event, EventCategory, CATEGORY_LABELS } from '@/types';
import SearchBar from '@/components/ui/SearchBar';
import EventGrid from '@/components/events/EventGrid';
import { ApiError } from '@/components/ui/ErrorBoundary';
import { BookmarkPlus, Filter, SlidersHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const categories: (EventCategory | 'all')[] = [
  'all', 'technical', 'workshop', 'cultural', 'sports', 'seminar', 'hackathon', 'webinar', 'conference',
];

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [eventState, setEventState] = useState<'all' | 'live' | 'open' | 'full'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'deadline'>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedPresets, setSavedPresets] = useState<any[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const presetKey = 'bec-event-filter-preset';

  useEffect(() => {
    loadEvents();
  }, [category, search, page]);

  useEffect(() => {
    if (user) {
      loadSavedPresets();
    }
  }, [user]);

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

  useEffect(() => {
    if (user) return;
    try {
      const saved = localStorage.getItem(presetKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.search) setSearch(parsed.search);
      if (parsed.eventState) setEventState(parsed.eventState);
      if (parsed.sortBy) setSortBy(parsed.sortBy);
    } catch {
      // ignore
    }
  }, []);

  const displayedEvents = useMemo(() => {
    let list = [...events];

    if (eventState === 'live') {
      list = list.filter((e) => e.isLive);
    } else if (eventState === 'open') {
      list = list.filter((e) => e.registrationOpen && e.registrationCount < e.maxParticipants);
    } else if (eventState === 'full') {
      list = list.filter((e) => e.registrationCount >= e.maxParticipants);
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    }

    return list;
  }, [events, eventState, sortBy]);

  const savePreset = () => {
    if (!user) {
      localStorage.setItem(
        presetKey,
        JSON.stringify({ category, search, eventState, sortBy })
      );
      toast.success('Filters saved locally');
      return;
    }

    const name = window.prompt('Name this filter preset:', `Preset ${savedPresets.length + 1}`)?.trim();
    if (!name) return;

    api.savedFilters.create({
      name,
      filters: { category, search, eventState, sortBy },
    })
      .then(() => {
        toast.success('Filter preset saved');
        loadSavedPresets();
      })
      .catch((err: any) => toast.error(err.message || 'Failed to save preset'));
  };

  const loadSavedPresets = async () => {
    try {
      const res = await api.savedFilters.list();
      setSavedPresets(res.data || []);
    } catch {
      // ignore preset fetch errors
    }
  };

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = savedPresets.find((p) => p._id === presetId);
    if (!preset) return;
    const filters = preset.filters || {};
    setCategory(filters.category || 'all');
    setSearch(filters.search || '');
    setEventState(filters.eventState || 'all');
    setSortBy(filters.sortBy || 'newest');
    setPage(1);
    toast.success(`Loaded "${preset.name}"`);
  };

  const deletePreset = async () => {
    if (!selectedPresetId) return;
    try {
      await api.savedFilters.delete(selectedPresetId);
      setSavedPresets((prev) => prev.filter((p) => p._id !== selectedPresetId));
      setSelectedPresetId('');
      toast.success('Preset deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete preset');
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

      {/* Advanced controls */}
      <div className="glass-card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
          <SlidersHorizontal className="w-4 h-4" /> Advanced
        </div>
        <select
          value={eventState}
          onChange={(e) => setEventState(e.target.value as any)}
          className="input-field !w-auto !py-2"
          aria-label="Filter by event state"
        >
          <option value="all">All states</option>
          <option value="live">Live now</option>
          <option value="open">Registration open</option>
          <option value="full">Full capacity</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="input-field !w-auto !py-2"
          aria-label="Sort events"
        >
          <option value="newest">Newest first</option>
          <option value="popular">Most popular</option>
          <option value="deadline">Closest deadline</option>
        </select>
        <button onClick={savePreset} className="btn-ghost inline-flex items-center gap-2 text-sm">
          <BookmarkPlus className="w-4 h-4" /> Save filters
        </button>
        {user && (
          <>
            <select
              value={selectedPresetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="input-field !w-auto !py-2 min-w-[180px]"
              aria-label="Load saved filter preset"
            >
              <option value="">Load preset</option>
              {savedPresets.map((preset) => (
                <option key={preset._id} value={preset._id}>{preset.name}</option>
              ))}
            </select>
            <button
              onClick={deletePreset}
              disabled={!selectedPresetId}
              className="btn-ghost inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete preset
            </button>
          </>
        )}
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
          events={displayedEvents}
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
