'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Event, AdminStats } from '@/types';
import { formatDate, getCategoryBg } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/types';
import { downloadCSV, downloadWord, printPDF } from '@/lib/export';
import {
  Calendar, Users, CheckCircle, Clock, BarChart3, Eye, EyeOff,
  Check, X, Star, Trash2, Download, Shield, TrendingUp, AlertCircle,
  FileSpreadsheet, FileText, Printer, ChevronDown, Edit
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
        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 transition-colors flex items-center gap-0.5"
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filter, events.length]);

  const loadData = async () => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.admin.stats(),
        api.admin.events(filter ? { status: filter } : {}),
        api.admin.anomalies(),
      ]);
      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      else setError(results[0].reason?.message);
      if (results[1].status === 'fulfilled') setEvents(results[1].value.data);
      else setError(results[1].reason?.message);
      if (results[2].status === 'fulfilled') setAnomalies(results[2].value.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      switch (action) {
        case 'approve':
          await api.admin.approve(id);
          toast.success('Event approved & published!');
          break;
        case 'publish':
          await api.admin.publish(id);
          toast.success('Event published');
          break;
        case 'reject':
          await api.admin.reject(id);
          toast.success('Event rejected');
          break;
        case 'toggleRegistration':
          await api.events.toggleRegistration(id);
          toast.success('Registration status toggled');
          break;
        case 'feature':
          await api.admin.feature(id);
          toast.success('Feature status toggled');
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this event?')) {
            await api.events.delete(id);
            toast.success('Event deleted');
          }
          break;
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const runBulkAction = async (action: 'approve' | 'reject' | 'publish') => {
    if (!selectedIds.length) return;
    setBulkProcessing(true);
    try {
      await Promise.all(
        selectedIds.map((id) => {
          if (action === 'approve') return api.admin.approve(id);
          if (action === 'reject') return api.admin.reject(id);
          return api.admin.publish(id);
        })
      );
      toast.success(`Bulk ${action} completed for ${selectedIds.length} event(s)`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || `Bulk ${action} failed`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const issueCertificatesForSelected = async () => {
    const selectedEvents = events.filter((e) => selectedIds.includes(e._id));
    if (!selectedEvents.length) return;
    setBulkProcessing(true);
    try {
      await Promise.all(selectedEvents.map((event) => api.certificates.issue(event._id)));
      toast.success(`Certificates issued for ${selectedEvents.length} event(s)`);
    } catch (err: any) {
      toast.error(err?.message || 'Certificate issuance failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  if (!user || (user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-500">Please sign in with an admin account.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'from-[#8B1E2D] to-[#6b4f4f]' },
    { label: 'Upcoming', value: stats?.upcomingEvents || 0, icon: Clock, color: 'from-[#C6A75E] to-[#8B1E2D]' },
    { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: Users, color: 'from-[#5B6E5D] to-[#3f4f42]' },
    { label: 'Attendance', value: stats?.totalAttendance || 0, icon: CheckCircle, color: 'from-[#a6844a] to-[#5f4b2a]' },
    { label: 'Pending', value: stats?.pendingEvents || 0, icon: AlertCircle, color: 'from-[#7f1d1d] to-[#8B1E2D]' },
    { label: 'Att. Rate', value: `${stats?.attendanceRate || 0}%`, icon: TrendingUp, color: 'from-[#B0B0B0] to-[#5B6E5D]' },
  ];

  const statusFilters = ['', 'pending', 'published', 'rejected', 'cancelled'];
  const flaggedEventIds = new Set(anomalies.map((a) => String(a.eventId)));
  const highAttendanceGap = anomalies.filter((a) => a.type === 'no-show-gap').slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage events, submissions, and platform operations</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/scanner" className="btn-secondary flex items-center gap-2 text-sm">
            QR Scanner
          </Link>
          <Link href="/admin/anomaly-rules" className="btn-secondary flex items-center gap-2 text-sm">
            Rules
          </Link>
          <Link href="/admin/analytics" className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/organizer/submit" className="btn-primary flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card text-center group hover:-translate-y-1 transition-all duration-300">
            <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Event Management */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Event Management</h2>
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {f || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => runBulkAction('approve')}
            disabled={!selectedIds.length || bulkProcessing}
            className="btn-secondary !py-2 text-xs"
          >
            Bulk approve ({selectedIds.length})
          </button>
          <button
            onClick={() => runBulkAction('publish')}
            disabled={!selectedIds.length || bulkProcessing}
            className="btn-secondary !py-2 text-xs"
          >
            Bulk publish
          </button>
          <button
            onClick={() => runBulkAction('reject')}
            disabled={!selectedIds.length || bulkProcessing}
            className="btn-danger !py-2 text-xs"
          >
            Bulk reject
          </button>
          <button
            onClick={issueCertificatesForSelected}
            disabled={!selectedIds.length || bulkProcessing}
            className="btn-secondary !py-2 text-xs"
          >
            Issue certificates
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  <input
                    type="checkbox"
                    checked={events.length > 0 && selectedIds.length === events.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? events.map((ev) => ev._id) : [])}
                    aria-label="Select all events"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Event</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Reg.</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-3 px-4 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(event._id)}
                      onChange={(e) => {
                        setSelectedIds((prev) =>
                          e.target.checked
                            ? (prev.includes(event._id) ? prev : [...prev, event._id])
                            : prev.filter((id) => id !== event._id)
                        );
                      }}
                      aria-label={`Select ${event.title}`}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/events/${event._id}`} className="text-white hover:text-primary-300 font-medium transition-colors">
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-600 mt-0.5">{event.organizerName}</p>
                    {flaggedEventIds.has(event._id) && (
                      <p className="text-[11px] text-red-300 mt-1">⚠ anomaly flagged</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
                      {CATEGORY_LABELS[event.category]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{formatDate(event.date)}</td>
                  <td className="py-3 px-4">
                    <span className={`badge text-xs ${
                      event.status === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      event.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {event.status}
                    </span>
                    {event.status === 'published' && (
                      <span className={`badge text-xs mt-1 ${
                        event.registrationOpen
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {event.registrationOpen ? '📖 Open' : '🔒 Closed'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {event.registrationCount}/{event.maxParticipants}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {event.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(event._id, 'approve')}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                            title="Approve & Publish"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(event._id, 'reject')}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {event.status === 'published' && (
                        <button
                          onClick={() => handleAction(event._id, 'toggleRegistration')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            event.registrationOpen
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                          title={event.registrationOpen ? 'Close Registration' : 'Open Registration'}
                        >
                          {event.registrationOpen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(event._id, 'feature')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          event.featured
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'text-gray-600 hover:bg-white/5'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/organizer/submit?edit=${event._id}`}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {event.registrationCount > 0 && (
                        <ExportDropdown eventId={event._id} />
                      )}
                      <button
                        onClick={() => handleAction(event._id, 'delete')}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <p className="text-center text-gray-500 py-8">No events found</p>
        )}
      </div>

      {/* Risk and gap report */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="text-sm uppercase tracking-[0.22em] text-[#B0B0B0] mb-3">Anomaly flags</h3>
          {anomalies.length === 0 ? (
            <p className="text-sm text-[#8f8f8f]">No anomalies detected in current filtered events.</p>
          ) : (
            <div className="space-y-2">
              {anomalies.slice(0, 5).map((a) => (
                <Link key={`${a.type}-${a.eventId}`} href={`/events/${a.eventId}`} className="block rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs text-red-300 mt-1">{a.message}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 className="text-sm uppercase tracking-[0.22em] text-[#B0B0B0] mb-3">Attendance gap report</h3>
          {highAttendanceGap.length === 0 ? (
            <p className="text-sm text-[#8f8f8f]">No significant attendance gaps detected.</p>
          ) : (
            <div className="space-y-2">
              {highAttendanceGap.map((a) => (
                <Link key={`${a.type}-${a.eventId}`} href={`/events/${a.eventId}`} className="block rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs text-yellow-300 mt-1">{a.message}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
