'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Event, CATEGORY_LABELS } from '@/types';
import { formatDate, getCategoryBg, isEventLive, generateGoogleCalendarUrl, timeUntil } from '@/lib/utils';
import CountdownTimer from '@/components/events/CountdownTimer';
import dynamic from 'next/dynamic';
import {
  Calendar, Clock, MapPin, Users, User, Building, Mail, Tag,
  ExternalLink, Share2, CalendarPlus, ArrowLeft, TrendingUp, Ticket,
  Bookmark, Eye, IndianRupee, UsersRound
} from 'lucide-react';
import toast from 'react-hot-toast';

const AnimatedBackground = dynamic(
  () => import('@/components/three/AnimatedBackground'),
  { ssr: false }
);

export default function EventDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string);
    }
  }, [params.id]);

  // Check bookmark status when event + user are ready
  useEffect(() => {
    if (event && user) {
      checkBookmark(event._id);
    }
  }, [event, user]);

  const loadEvent = async (id: string) => {
    try {
      // If id looks like a MongoDB ObjectId use direct lookup, otherwise try slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const res = isObjectId
        ? await api.events.get(id)
        : await api.events.getBySlug(id);
      setEvent(res.data);
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async (eventId: string) => {
    try {
      const res = await api.bookmarks.check(eventId);
      setBookmarked(res.bookmarked);
    } catch {
      // Not logged in or error — ignore
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Sign in to bookmark events');
      return;
    }
    if (!event) return;
    setBookmarkLoading(true);
    try {
      const res = await api.bookmarks.toggle(event._id);
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? 'Event bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description?.slice(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <Link href="/events" className="text-primary-400 hover:underline">Browse all events</Link>
        </div>
      </div>
    );
  }

  const live = isEventLive(event.date, event.endDate);
  const remaining = Math.max(0, event.maxParticipants - event.registrationCount);
  const isTrending = event.registrationCount >= event.maxParticipants * 0.7;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  const isFull = remaining === 0;
  const isRegClosed = !event.registrationOpen;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <AnimatedBackground className="opacity-30" />

        {event.poster ? (
          <>
            <div className="absolute inset-0">
              <img src={event.poster} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-vortex-dark/50 via-vortex-dark/70 to-vortex-dark" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-vortex-dark/40 via-vortex-dark/70 to-vortex-dark" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="w-full">
            <Link href="/events" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${getCategoryBg(event.category)}`}>
                {CATEGORY_LABELS[event.category]}
              </span>
              {live && (
                <span className="badge-live">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-ping" />
                  LIVE NOW
                </span>
              )}
              {isTrending && <span className="badge-trending"><TrendingUp className="w-3 h-3 mr-1" /> Trending</span>}
              {isFull && (
                <span className="badge bg-red-500/20 text-red-300 border-red-500/30 font-bold tracking-wide">
                  🔴 REGISTRATION FULL
                </span>
              )}
              {!isFull && !isRegClosed && isPastDeadline && (
                <span className="badge bg-orange-500/20 text-orange-300 border-orange-500/30 font-bold tracking-wide">
                  ⏰ DEADLINE PASSED
                </span>
              )}
              {isRegClosed && !isFull && (
                <span className="badge bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-bold tracking-wide">
                  🔒 REGISTRATION NOT OPEN
                </span>
              )}
              {event.featured && <span className="badge bg-primary-500/20 text-primary-300 border-primary-500/30">⭐ Featured</span>}
              <span className="badge bg-white/[0.06] text-gray-400 border-white/[0.08]">
                <Eye className="w-3 h-3 mr-1" /> {event.views ?? 0} views
              </span>
              {event.pricingType === 'paid' ? (
                <span className="badge bg-primary-500/20 text-primary-300 border-primary-500/30">
                  <IndianRupee className="w-3 h-3 mr-1" /> ₹{event.price} {event.priceType === 'per_team' ? '/team' : '/person'}
                </span>
              ) : (
                <span className="badge bg-green-500/20 text-green-300 border-green-500/30">🎉 Free</span>
              )}
              {event.participationType === 'team' && (
                <span className="badge bg-[#8B1E2D]/20 text-[#D6C7A1] border-[#8B1E2D]/30">
                  <UsersRound className="w-3 h-3 mr-1" /> Team ({event.minTeamSize}–{event.maxTeamSize})
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-400" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-400" />
                {event.time}{event.endTime ? ` — ${event.endTime}` : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-400" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown */}
            {!live && new Date(event.date) > new Date() && (
              <div className="glass-card">
                <h3 className="text-lg font-semibold text-white mb-4">Event Starts In</h3>
                <CountdownTimer targetDate={event.date} />
              </div>
            )}

            {/* Description */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">About This Event</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/[0.06]">
                  {event.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 glass rounded-full text-xs text-gray-400">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Organizer */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">Organizer</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-[#6b4f4f] flex items-center justify-center text-lg font-bold text-white">
                  {event.organizerName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{event.organizerName}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5" /> {event.organizerDepartment}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5" /> {event.organizerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Poster */}
            {event.poster && (
              <div className="glass-card p-0 overflow-hidden rounded-2xl">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            )}

            {/* Registration Card */}
            <div className="glass-card sticky top-24">
              {/* Full / Closed Banner */}
              {isFull && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <span className="text-sm font-bold text-red-400">🔴 Registration Full — {event.registrationCount}/{event.maxParticipants}</span>
                </div>
              )}
              {isRegClosed && !isFull && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                  <span className="text-sm font-bold text-yellow-400">🔒 Registration Not Open Yet</span>
                  <p className="text-xs text-gray-500 mt-1">The organizer will open registration soon.</p>
                </div>
              )}
              {!isFull && !isRegClosed && isPastDeadline && (
                <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                  <span className="text-sm font-bold text-orange-400">⏰ Registration Closed — Deadline Passed</span>
                </div>
              )}
              {/* Pricing Banner */}
              {event.pricingType === 'paid' ? (
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                  <span className="text-sm text-gray-300">Entry Fee</span>
                  <span className="text-lg font-bold text-primary-300 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />₹{event.price}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      {event.priceType === 'per_team' ? '/team' : '/person'}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-300">🎉 Free Event — No Entry Fee</span>
                </div>
              )}

              {event.participationType === 'team' && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[#8B1E2D]/10 border border-[#8B1E2D]/20">
                  <span className="text-sm text-gray-300 flex items-center gap-1.5">
                    <UsersRound className="w-4 h-4 text-[#C6A75E]" /> Team Event
                  </span>
                  <span className="text-sm font-medium text-[#D6C7A1]">
                    {event.minTeamSize}–{event.maxTeamSize} members
                  </span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Registered</span>
                  <span className="text-white font-semibold">{event.registrationCount} / {event.maxParticipants}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-primary-500 to-[#6b4f4f]'
                    }`}
                    style={{ width: `${Math.min(100, (event.registrationCount / event.maxParticipants) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isFull ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                    {isFull ? 'No seats available' : `${remaining} seats remaining`}
                  </span>
                  <span className="text-gray-500">Deadline: {formatDate(event.registrationDeadline)}</span>
                </div>
              </div>

              {event.registrationType === 'internal' ? (
                <Link
                  href={isFull || isPastDeadline || isRegClosed ? '#' : `/register/${event._id}`}
                  className={`btn-primary w-full flex items-center justify-center gap-2 ${
                    isFull || isPastDeadline || isRegClosed ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  {isFull ? '🔴 Event Full' : isRegClosed ? '🔒 Registration Not Open' : isPastDeadline ? '⏰ Registration Closed' :
                   event.pricingType === 'paid' ? `Register & Pay ₹${event.price}` : 'Register Now'}
                </Link>
              ) : isRegClosed ? (
                <div className="btn-primary w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                  <Ticket className="w-4 h-4" /> 🔒 Registration Not Open
                </div>
              ) : (
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Register (External)
                </a>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`btn-secondary flex items-center justify-center gap-2 text-sm ${
                    bookmarked ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' : ''
                  }`}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark event'}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
                <a
                  href={generateGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <CalendarPlus className="w-4 h-4" /> Calendar
                </a>
                <button onClick={handleShare} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="text-white">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary-400" />
                  <div>
                    <p className="text-gray-400">Time</p>
                    <p className="text-white">{event.time}{event.endTime ? ` — ${event.endTime}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <div>
                    <p className="text-gray-400">Venue</p>
                    <p className="text-white">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-primary-400" />
                  <div>
                    <p className="text-gray-400">Capacity</p>
                    <p className="text-white">{event.maxParticipants} participants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
