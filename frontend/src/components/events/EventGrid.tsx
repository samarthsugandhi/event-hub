'use client';

import { Event } from '@/types';
import EventCard from './EventCard';

interface EventGridProps {
  events: Event[];
  title?: string;
  emptyMessage?: string;
}

export default function EventGrid({ events, title, emptyMessage = 'No events found' }: EventGridProps) {
  return (
    <section>
      {title && <h2 className="section-title tracking-[-0.02em]">{title}</h2>}
      {events.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-[#B0B0B0]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
