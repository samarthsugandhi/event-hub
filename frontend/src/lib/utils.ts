import { clsx, type ClassValue } from 'clsx';
import { EventCategory, CATEGORY_COLORS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time;
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeUntil(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function isEventLive(date: string | Date, endDate?: string | Date): boolean {
  const now = new Date();
  const start = new Date(date);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 4 * 60 * 60 * 1000);
  return now >= start && now <= end;
}

export function getCategoryColor(category: EventCategory): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

export function getCategoryBg(category: EventCategory): string {
  const colors: Record<string, string> = {
    technical: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    workshop: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    cultural: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    sports: 'bg-green-500/20 text-green-300 border-green-500/30',
    seminar: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    hackathon: 'bg-red-500/20 text-red-300 border-red-500/30',
    webinar: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    conference: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };
  return colors[category] || colors.other;
}

export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  venue: string;
}): string {
  const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = event.endDate
    ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
