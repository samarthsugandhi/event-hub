'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Event, Registration, TeamMember } from '@/types';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, User, Mail, Phone, Building, GraduationCap, Hash,
  CheckCircle, Download, QrCode, Calendar, MapPin, AlertCircle,
  UsersRound, IndianRupee, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [usnError, setUsnError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    usn: '',
    teamName: '',
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Check if viewing an existing pass
  const passId = searchParams.get('pass');

  useEffect(() => {
    if (params.eventId) loadEvent(params.eventId as string);
  }, [params.eventId]);

  useEffect(() => {
    if (passId) {
      loadPass(passId);
    }
  }, [passId]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || f.name,
        email: user.email || f.email,
        phone: user.phone || f.phone,
        department: user.department || f.department,
        year: user.year || f.year,
        usn: user.usn || f.usn,
      }));
    }
  }, [user]);

  const loadEvent = async (id: string) => {
    try {
      const res = await api.events.get(id);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPass = async (registrationId: string) => {
    try {
      const res = await api.registrations.pass(registrationId);
      if (res.data) {
        setRegistration(res.data);
        // Also set the event from the populated pass data
        if (res.data.eventId && typeof res.data.eventId === 'object') {
          setEvent(res.data.eventId as any);
        }
      }
    } catch (err) {
      console.error('Failed to load pass:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validate USN/CSN format
  const validateUSN = (usn: string, year: string): string => {
    if (!usn.trim()) return '';
    const usnUpper = usn.toUpperCase().trim();
    const csnRegex = /^20\d{8}$/;
    const usnRegex = /^2BA\d{2}[A-Z]{2}\d{3}$/;

    if (year === '1st') {
      if (!csnRegex.test(usnUpper)) {
        return 'Invalid CSN. Format: 2025XXXXXX (e.g., 2025010590)';
      }
    } else {
      if (!usnRegex.test(usnUpper) && !csnRegex.test(usnUpper)) {
        return 'Invalid USN. Format: 2BAXXXXXXX (e.g., 2BA23IS080)';
      }
    }
    return '';
  };

  const handleUSNChange = (usn: string) => {
    setForm({ ...form, usn });
    if (usn.length >= 3) {
      setUsnError(validateUSN(usn, form.year));
    } else {
      setUsnError('');
    }
  };

  // Team member management
  const addTeamMember = () => {
    if (event && teamMembers.length >= (event.maxTeamSize || 4) - 1) {
      toast.error(`Max team size is ${event.maxTeamSize} (including you)`);
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '', usn: '' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.eventId) return;

    // Validate USN before submit
    if (form.usn) {
      const err = validateUSN(form.usn, form.year);
      if (err) {
        setUsnError(err);
        toast.error(err);
        return;
      }
    }

    // Validate team fields
    if (event?.participationType === 'team') {
      if (!form.teamName.trim()) {
        toast.error('Team name is required');
        return;
      }
      const totalSize = 1 + teamMembers.length;
      if (totalSize < (event.minTeamSize || 2)) {
        toast.error(`Team must have at least ${event.minTeamSize} members (including you)`);
        return;
      }
      // Validate team member fields
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].name.trim() || !teamMembers[i].usn.trim()) {
          toast.error(`Please fill in name and USN for team member ${i + 1}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (event?.participationType === 'team') {
        body.teamName = form.teamName;
        body.teamMembers = teamMembers;
      }
      const res = await api.registrations.register(params.eventId as string, body);
      const reg = res.data.registration;

      // If paid event, redirect to payment page
      if (event?.pricingType === 'paid' && reg.paymentStatus === 'pending') {
        toast.success('Registration successful! Redirecting to payment… 💳');
        router.push(`/payment/${reg.registrationId}`);
        return;
      }

      setRegistration(reg);
      toast.success('Registration successful! Your event pass is ready. 🎫');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPass = () => {
    if (!registration) return;
    const link = document.createElement('a');
    link.href = registration.qrCode;
    link.download = `event-pass-${registration.registrationId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event && !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  // Show Event Pass if registered (from form submission or from pass query param)
  if (registration) {
    const passEvent = event || (typeof registration.eventId === 'object' ? registration.eventId as unknown as Event : null);

    return (
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {passId ? 'Your Event Pass' : 'Registration Successful!'}
          </h2>
          <p className="text-gray-400 mb-6">
            {passId ? 'Present this pass at the event venue' : 'Your event pass has been generated'}
          </p>

          {/* Event Pass */}
          <div className="glass rounded-2xl p-6 mb-6 border border-primary-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-primary-400 font-mono">{registration.registrationId}</span>
              <span className="text-xs text-gray-500 font-semibold">BEC Event Hub</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">
              {passEvent?.title || 'Event'}
            </h3>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Participant</span>
                <span className="text-white font-medium">{registration.name}</span>
              </div>
              {passEvent?.date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-white">{formatDate(passEvent.date)}</span>
                </div>
              )}
              {passEvent?.time && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="text-white">{passEvent.time}</span>
                </div>
              )}
              {passEvent?.venue && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue</span>
                  <span className="text-white">{passEvent.venue}</span>
                </div>
              )}
              {registration.usn && (
                <div className="flex justify-between">
                  <span className="text-gray-500">USN</span>
                  <span className="text-white font-mono">{registration.usn}</span>
                </div>
              )}
              {/* Payment Status */}
              {registration.paymentStatus && registration.paymentStatus !== 'not_required' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className={`font-medium ${
                    registration.paymentStatus === 'completed' ? 'text-green-400' :
                    registration.paymentStatus === 'pending' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {registration.paymentStatus === 'completed' ? '✅ Paid' :
                     registration.paymentStatus === 'pending' ? '⏳ Pending' :
                     '❌ Failed'}
                    {registration.paymentAmount > 0 && ` — ₹${registration.paymentAmount}`}
                  </span>
                </div>
              )}
              {registration.teamName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Team</span>
                  <span className="text-white font-medium">{registration.teamName}</span>
                </div>
              )}
              {registration.teamMembers && registration.teamMembers.length > 0 && (
                <div className="text-left pt-2 border-t border-white/[0.06]">
                  <span className="text-gray-500 text-xs block mb-1">Team Members</span>
                  {registration.teamMembers.map((m, i) => (
                    <span key={i} className="text-white text-xs block">{m.name} ({m.usn})</span>
                  ))}
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl p-4 inline-block">
              <img src={registration.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>

            <p className="text-xs text-gray-500 mt-4">Present this QR code at the event venue</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDownloadPass} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Pass
            </button>
            {registration.paymentStatus === 'pending' && (
              <Link
                href={`/payment/${registration.registrationId}`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl text-white text-sm transition-all duration-300 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
              >
                <IndianRupee className="w-4 h-4" /> Pay Now
              </Link>
            )}
            <Link href="/events" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  const isTeamEvent = event.participationType === 'team';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <Link href={`/events/${event._id}`} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Event
      </Link>

      <div className="glass-card">
        <div className="mb-6 pb-6 border-b border-white/[0.06]">
          <h1 className="text-2xl font-bold text-white mb-1">Register for Event</h1>
          <p className="text-lg text-primary-300 font-medium">{event.title}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-400" /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-400" /> {event.venue}</span>
          </div>
          {/* Pricing & participation info */}
          <div className="flex flex-wrap gap-2 mt-3">
            {event.pricingType === 'paid' ? (
              <span className="badge bg-primary-500/20 text-primary-300 border-primary-500/30 flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> ₹{event.price} {event.priceType === 'per_team' ? '/team' : '/person'}
              </span>
            ) : (
              <span className="badge bg-green-500/20 text-green-300 border-green-500/30">🎉 Free</span>
            )}
            {isTeamEvent && (
              <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                <UsersRound className="w-3 h-3" /> Team ({event.minTeamSize}–{event.maxTeamSize} members)
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Team leader / individual info */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">
              {isTeamEvent ? 'Team Leader Name' : 'Full Name'} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-11"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email <span className="text-red-400">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Phone <span className="text-red-400">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field pl-11"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Department <span className="text-red-400">*</span></label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="input-field pl-11 appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Year <span className="text-red-400">*</span></label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  required
                  value={form.year}
                  onChange={(e) => {
                    setForm({ ...form, year: e.target.value, usn: '' });
                    setUsnError('');
                  }}
                  className="input-field pl-11 appearance-none"
                >
                  <option value="">Select</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">
              {form.year === '1st' ? 'CSN (College Serial Number)' : 'USN (University Seat Number)'} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={form.usn}
                onChange={(e) => handleUSNChange(e.target.value)}
                className={`input-field pl-11 uppercase ${usnError ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                placeholder={form.year === '1st' ? '2025XXXXXX (e.g., 2025010590)' : '2BAXXXXXXX (e.g., 2BA23IS080)'}
              />
            </div>
            {usnError ? (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {usnError}
              </p>
            ) : (
              <p className="text-[11px] text-gray-600 mt-1">
                {form.year === '1st'
                  ? 'CSN format: Year prefix (2025) + 6 digit serial number'
                  : 'USN format: 2BA + admission year + branch code + roll number'}
              </p>
            )}
          </div>

          {/* Team Section */}
          {isTeamEvent && (
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-purple-400" /> Team Details
              </h3>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Team Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.teamName}
                  onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Code Crusaders"
                />
              </div>

              <p className="text-xs text-gray-500">
                You are the team leader. Add {event.minTeamSize - 1}–{event.maxTeamSize - 1} more members below.
              </p>

              {teamMembers.map((member, i) => (
                <div key={i} className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Member {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(i)}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={member.name}
                      onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(i, 'email', e.target.value)}
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="USN *"
                      value={member.usn}
                      onChange={(e) => updateTeamMember(i, 'usn', e.target.value)}
                      className="input-field text-sm uppercase"
                      required
                    />
                  </div>
                </div>
              ))}

              {teamMembers.length < (event.maxTeamSize || 4) - 1 && (
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Team Member
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !!usnError}
            className="btn-primary w-full flex items-center justify-center gap-2 !mt-8"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {event?.pricingType === 'paid' ? 'Registering & Redirecting to Payment...' : 'Registering...'}
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                {event?.pricingType === 'paid'
                  ? `Register & Pay ₹${event.price}`
                  : 'Register & Get Event Pass'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
