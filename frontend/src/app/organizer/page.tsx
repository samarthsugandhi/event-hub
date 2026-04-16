'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Event, CATEGORY_LABELS } from '@/types';
import { formatDate, getCategoryBg } from '@/lib/utils';
import { downloadCSV, downloadWord, printPDF } from '@/lib/export';
import {
  Plus, Calendar, Users, CheckCircle, Clock, Download, BarChart3, Eye, EyeOff, Edit,
  FileSpreadsheet, FileText, Printer, ChevronDown, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

function ExportDropdown({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format: 'csv' | 'word' | 'pdf') => {
    setOpen(false);
    try {
      toast.loading(`Preparing export…`, { id: 'export' });
      if (format === 'csv') await downloadCSV(eventId);
      else if (format === 'word') await downloadWord(eventId);
      else await printPDF(eventId);
      toast.success('Export ready!', { id: 'export' });
    } catch (err: any) {
      toast.error(err.message || 'Export failed', { id: 'export' });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors flex items-center gap-0.5"
        title="Download Participants"
      >
        <Download className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 glass rounded-xl border border-white/10 shadow-2xl py-1 min-w-[160px] animate-fade-in">
          <button onClick={() => handleExport('csv')} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] flex items-center gap-2 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-400" /> CSV (Excel)
          </button>
          <button onClick={() => handleExport('word')} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4 text-blue-400" /> Word (.doc)
          </button>
          <button onClick={() => handleExport('pdf')} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] flex items-center gap-2 transition-colors">
            <Printer className="w-4 h-4 text-red-400" /> Print / PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      // Organizers see their own events (all statuses)
      const res = await api.events.my();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-4">Sign in to manage your events.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.date) > new Date()).length,
    totalRegs: events.reduce((sum, e) => sum + e.registrationCount, 0),
    totalAtt: events.reduce((sum, e) => sum + e.attendanceCount, 0),
  };

  const approvalTimeline = {
    pending: events.filter((e) => e.status === 'pending').length,
    approved: events.filter((e) => ['approved', 'published', 'completed'].includes(e.status)).length,
    rejected: events.filter((e) => e.status === 'rejected').length,
  };

  const averageFillRate = events.length
    ? Math.round(
        events.reduce((sum, e) => sum + ((e.registrationCount || 0) / Math.max(1, e.maxParticipants || 1)) * 100, 0) / events.length
      )
    : 0;

  const topEvent = [...events].sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0))[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your events and track registrations</p>
        </div>
        <Link href="/organizer/submit" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Submit Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Events', value: stats.total, icon: Calendar, color: 'from-[#8B1E2D] to-[#6b4f4f]' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'from-[#C6A75E] to-[#8B1E2D]' },
          { label: 'Registrations', value: stats.totalRegs, icon: Users, color: 'from-[#5B6E5D] to-[#3f4f42]' },
          { label: 'Attendance', value: stats.totalAtt, icon: CheckCircle, color: 'from-[#a6844a] to-[#5f4b2a]' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card text-center">
            <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Organizer insights */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="text-sm uppercase tracking-[0.2em] text-[#B0B0B0] mb-4">Approval timeline</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="metric-tile">
              <p className="text-xs text-[#AFAFAF]">Pending</p>
              <p className="text-2xl font-semibold text-yellow-300 mt-1">{approvalTimeline.pending}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs text-[#AFAFAF]">Approved</p>
              <p className="text-2xl font-semibold text-green-300 mt-1">{approvalTimeline.approved}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs text-[#AFAFAF]">Rejected</p>
              <p className="text-2xl font-semibold text-red-300 mt-1">{approvalTimeline.rejected}</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-sm uppercase tracking-[0.2em] text-[#B0B0B0] mb-4">Registration export insights</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-tile">
              <p className="text-xs text-[#AFAFAF]">Avg fill rate</p>
              <p className="text-2xl font-semibold text-white mt-1">{averageFillRate}%</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs text-[#AFAFAF]">Top event</p>
              <p className="text-sm font-semibold text-white mt-2 truncate">{topEvent?.title || '—'}</p>
              <p className="text-xs text-[#AFAFAF] mt-1">{topEvent ? `${topEvent.registrationCount} regs` : 'No data'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="glass-card">
        <h2 className="text-xl font-semibold text-white mb-6">My Events</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t submitted any events yet</p>
            <Link href="/organizer/submit" className="btn-primary">Submit Your First Event</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="glass rounded-xl p-5 flex items-center gap-5 group hover:bg-white/[0.04] transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/events/${event._id}`} className="text-white font-medium hover:text-primary-300 truncate">
                      {event.title}
                    </Link>
                    <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span className={`badge text-xs ${
                      event.status === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {event.status}
                    </span>
                    {event.status === 'published' && (
                      <span className={`badge text-xs ${
                        event.registrationOpen
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {event.registrationOpen ? '📖 Reg Open' : '🔒 Reg Closed'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.venue}</span>
                    <span>{event.registrationCount}/{event.maxParticipants} registered</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.status === 'published' && (
                    <button
                      onClick={async () => {
                        try {
                          await api.events.toggleRegistration(event._id);
                          toast.success(event.registrationOpen ? 'Registration closed' : 'Registration opened!');
                          loadMyEvents();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to toggle registration');
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        event.registrationOpen
                          ? 'text-green-400 hover:bg-green-500/10'
                          : 'text-yellow-400 hover:bg-yellow-500/10'
                      }`}
                      title={event.registrationOpen ? 'Close Registration' : 'Open Registration'}
                    >
                      {event.registrationOpen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                  <Link href={`/events/${event._id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors" title="View Event">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/organizer/submit?edit=${event._id}`} className="p-2 rounded-lg hover:bg-primary-500/10 text-gray-400 hover:text-primary-300 transition-colors" title="Edit Event">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link href={`/organizer/submit?duplicate=${event._id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors" title="Duplicate Event">
                    <Copy className="w-4 h-4" />
                  </Link>
                  <Link href={`/admin/analytics`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors" title="Analytics">
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                  {event.registrationCount > 0 && (
                    <ExportDropdown eventId={event._id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
