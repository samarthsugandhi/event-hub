'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight, TrendingUp, IndianRupee, UsersRound } from 'lucide-react';
import { Event, CATEGORY_LABELS } from '@/types';
import { formatDate, getCategoryBg, isEventLive } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const live = isEventLive(event.date, event.endDate);
  const remainingSeats = Math.max(0, event.maxParticipants - event.registrationCount);
  const isFull = remainingSeats === 0;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  const isTrending = event.registrationCount >= event.maxParticipants * 0.7 && !isFull;
  const fillPercent = Math.min(100, (event.registrationCount / event.maxParticipants) * 100);

  return (
    <Link href={`/events/${event._id}`}>
      <div className="group glass-card-hover relative overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Poster */}
        <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-2xl">
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,30,45,0.28), rgba(198,167,94,0.18))',
              }}
            >
              <span className="text-4xl opacity-40">📅</span>
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`badge ${getCategoryBg(event.category)} backdrop-blur-md text-xs`}>
              {CATEGORY_LABELS[event.category]}
            </span>
            {live && (
              <span className="badge-live backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-ping" />
                LIVE
              </span>
            )}
            {isFull && (
              <span className="badge bg-red-500/20 text-red-300 border-red-500/30 backdrop-blur-md text-[10px] font-bold tracking-wide">
                REGISTRATION FULL
              </span>
            )}
            {!isFull && isPastDeadline && (
              <span className="badge bg-orange-500/20 text-orange-300 border-orange-500/30 backdrop-blur-md text-[10px] font-bold tracking-wide">
                REGISTRATION CLOSED
              </span>
            )}
            {isTrending && !live && !isFull && (
              <span className="badge-trending backdrop-blur-md">
                <TrendingUp className="w-3 h-3 mr-1" /> Trending
              </span>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col pt-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-[#C6A75E] transition-colors line-clamp-2 mb-2">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
              <Calendar className="w-3.5 h-3.5 text-[#C6A75E]" />
              <span>{formatDate(event.date)}</span>
              {event.time && <span className="text-[#7f7f7f]">• {event.time}</span>}
            </div>
            <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
              <MapPin className="w-3.5 h-3.5 text-[#C6A75E]" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
              <Users className="w-3.5 h-3.5 text-[#C6A75E]" />
              <span>{event.registrationCount} / {event.maxParticipants} registered</span>
            </div>
          </div>

          {/* Fill bar */}
          <div className="mb-3">
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPercent}%`,
                  background: isFull
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : fillPercent > 90
                    ? 'linear-gradient(90deg, #8B1E2D, #6B4F4F)'
                    : fillPercent > 60
                    ? 'linear-gradient(90deg, #6B4F4F, #C6A75E)'
                    : 'linear-gradient(90deg, #5B6E5D, #C6A75E)',
                }}
              />
            </div>
            <p className={`text-xs mt-1 ${isFull ? 'text-red-400 font-semibold' : isPastDeadline ? 'text-[#6B4F4F] font-medium' : 'text-[#9a9a9a]'}`}>
              {isFull ? '🔴 Registration Full' : isPastDeadline ? '⏰ Registration Closed' : `${remainingSeats} seats left`}
            </p>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              {event.pricingType === 'paid' ? (
                <span className="text-xs font-medium text-[#C6A75E] flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />₹{event.price}
                </span>
              ) : (
                <span className="text-xs font-medium text-[#5B6E5D]">Free</span>
              )}
              {event.participationType === 'team' && (
                <span className="text-xs text-[#B0B0B0] flex items-center gap-0.5">
                  <UsersRound className="w-3 h-3" /> Team
                </span>
              )}
            </div>
            <span className="text-[#C6A75E] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
