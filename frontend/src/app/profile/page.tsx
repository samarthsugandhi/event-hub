'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Registration, Bookmark, CATEGORY_LABELS } from '@/types';
import { formatDate, getCategoryBg } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  User, Mail, Building, GraduationCap, Edit, Save, Phone, Hash,
  Calendar, Ticket, CheckCircle, QrCode, Bookmark as BookmarkIcon, Trash2,
  IndianRupee, AlertCircle, X as XIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    department: user?.department || '',
    year: user?.year || '',
    usn: user?.usn || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: (user as any)?.phone || '',
        department: user.department || '',
        year: user.year || '',
        usn: user.usn || '',
      });
      loadRegistrations();
      loadBookmarks();
    }
  }, [user]);

  const loadRegistrations = async () => {
    try {
      const res = await api.registrations.my();
      setRegistrations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const res = await api.bookmarks.list();
      setBookmarks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const removeBookmark = async (eventId: string) => {
    try {
      await api.bookmarks.remove(eventId);
      setBookmarks((prev) => prev.filter((b) => (b.eventId as any)?._id !== eventId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setSaving(true);
    try {
      const res = await api.auth.update(form);
      // Update auth context with the new user data
      const updatedUser = res.user || res.data;
      setUser(updatedUser);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
          <Link href="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.attended || r.attendanceStatus === 'present').length,
    upcoming: registrations.filter((r) => r.eventId && new Date((r.eventId as any).date) > new Date()).length,
    saved: bookmarks.length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Card */}
      <div className="glass-card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-[#6b4f4f] flex items-center justify-center text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field text-lg font-bold mb-1"
                  placeholder="Full Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              )}
              {editing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Email address"
                    type="email"
                  />
                </div>
              ) : (
                <p className="text-gray-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing && (
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: user.name,
                    email: user.email,
                    phone: (user as any)?.phone || '',
                    department: user.department || '',
                    year: user.year || '',
                    usn: user.usn || '',
                  });
                }}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <XIcon className="w-4 h-4" /> Cancel
              </button>
            )}
            <button
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
              className="btn-ghost flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : editing ? (
                <><Save className="w-4 h-4" /> Save</>
              ) : (
                <><Edit className="w-4 h-4" /> Edit Profile</>
              )}
            </button>
          </div>
        </div>

        {/* Editable fields section */}
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 glass rounded-xl">
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field text-sm"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3" /> Department
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Science">Information Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {(user.role === 'student') && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Year
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="">Select</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> USN
                  </label>
                  <input
                    value={form.usn}
                    onChange={(e) => setForm((p) => ({ ...p, usn: e.target.value.toUpperCase() }))}
                    className="input-field text-sm uppercase"
                    placeholder="e.g. 2BA23CS001"
                  />
                </div>
              </>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="glass rounded-xl p-3 text-center">
            <GraduationCap className="w-5 h-5 text-primary-400 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Role</p>
            <p className="text-white font-medium capitalize">{user.role}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Building className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Department</p>
            <p className="text-white font-medium">{user.department || '—'}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Ticket className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Registrations</p>
            <p className="text-white font-medium">{stats.total}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <CheckCircle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Attended</p>
            <p className="text-white font-medium">{stats.attended}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <BookmarkIcon className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Saved</p>
            <p className="text-white font-medium">{stats.saved}</p>
          </div>
        </div>
      </div>

      {/* My Registrations */}
      <div className="glass-card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-400" /> My Registrations
        </h2>

        {loadingRegs ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t registered for any events yet</p>
            <Link href="/events" className="btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => {
              const event = reg.eventId as any;
              return (
                <div
                  key={reg._id}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/events/${event?._id || ''}`} className="text-white font-medium hover:text-primary-300 truncate">
                        {event?.title || 'Event'}
                      </Link>
                      {event?.category && (
                        <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
                          {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{event?.date ? formatDate(event.date) : 'TBD'}</span>
                      <span>{event?.venue || ''}</span>
                      {reg.attended || reg.attendanceStatus === 'present' ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" /> Attended
                        </span>
                      ) : null}
                      {reg.paymentStatus === 'pending' && (
                        <span className="flex items-center gap-1 text-yellow-400 font-medium">
                          <AlertCircle className="w-3 h-3" /> Payment Pending
                        </span>
                      )}
                      {reg.paymentStatus === 'completed' && (
                        <span className="flex items-center gap-1 text-green-400">
                          <IndianRupee className="w-3 h-3" /> Paid ₹{reg.paymentAmount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {reg.paymentStatus === 'pending' && (
                      <Link
                        href={`/payment/${reg.registrationId}`}
                        className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                        title="Complete Payment"
                      >
                        Pay Now
                      </Link>
                    )}
                    <Link
                      href={`/register/${event?._id}?pass=${reg.registrationId}`}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                      title="View Pass"
                    >
                      <QrCode className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Events (Bookmarks) */}
      <div className="glass-card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-yellow-400" /> Saved Events
        </h2>

        {loadingBookmarks ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No saved events yet. Bookmark events to find them here!</p>
            <Link href="/events" className="btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => {
              const event = bookmark.eventId as any;
              if (!event) return null;
              return (
                <div
                  key={bookmark._id}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/events/${event._id}`} className="text-white font-medium hover:text-primary-300 truncate">
                        {event.title}
                      </Link>
                      {event.category && (
                        <span className={`badge ${getCategoryBg(event.category)} text-xs`}>
                          {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{event.date ? formatDate(event.date) : 'TBD'}</span>
                      <span>{event.venue || ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(event._id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
