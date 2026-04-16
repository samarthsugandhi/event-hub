'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CATEGORY_LABELS } from '@/types';
import toast from 'react-hot-toast';
import {
  Upload, Calendar, Clock, MapPin, Users, Tag, FileText,
  Image, X, ArrowLeft, Globe, Lock, IndianRupee, UsersRound, Save
} from 'lucide-react';
import Link from 'next/link';

export default function SubmitEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SubmitEventInner />
    </Suspense>
  );
}

function SubmitEventInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const duplicateId = searchParams.get('duplicate');
  const isEditMode = !!editId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: '',
    coordinates: { lat: '', lng: '' },
    maxParticipants: '100',
    registrationType: 'internal',
    externalLink: '',
    registrationDeadline: '',
    tags: '',
    organizerName: user?.name || '',
    organizerDepartment: user?.department || '',
    organizerEmail: user?.email || '',
    // Pricing
    pricingType: 'free',
    price: '',
    priceType: 'per_person',
    // Team config
    participationType: 'individual',
    minTeamSize: '2',
    maxTeamSize: '4',
  });

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load event data in edit/duplicate mode
  useEffect(() => {
    const sourceId = editId || duplicateId;
    if (sourceId) {
      setLoadingEvent(true);
      api.events.get(sourceId)
        .then((res: any) => {
          const e = res.data;
          const dateObj = e.date ? new Date(e.date) : null;
          const endDateObj = e.endDate ? new Date(e.endDate) : null;
          setForm({
            title: duplicateId ? `${e.title} (Copy)` : (e.title || ''),
            description: e.description || '',
            category: e.category || 'technical',
            date: dateObj ? dateObj.toISOString().split('T')[0] : '',
            time: e.time || (dateObj ? dateObj.toTimeString().slice(0, 5) : ''),
            endDate: endDateObj ? endDateObj.toISOString().split('T')[0] : '',
            endTime: e.endTime || '',
            venue: e.venue || '',
            coordinates: {
              lat: e.locationCoordinates?.lat?.toString() || '',
              lng: e.locationCoordinates?.lng?.toString() || '',
            },
            maxParticipants: e.maxParticipants?.toString() || '100',
            registrationType: e.registrationType || 'internal',
            externalLink: e.externalLink || '',
            registrationDeadline: e.registrationDeadline
              ? new Date(e.registrationDeadline).toISOString().slice(0, 16)
              : '',
            tags: e.tags?.join(', ') || '',
            organizerName: e.organizerName || user?.name || '',
            organizerDepartment: e.organizerDepartment || user?.department || '',
            organizerEmail: e.organizerEmail || user?.email || '',
            pricingType: e.pricingType || 'free',
            price: e.price?.toString() || '',
            priceType: e.priceType || 'per_person',
            participationType: e.participationType || 'individual',
            minTeamSize: e.minTeamSize?.toString() || '2',
            maxTeamSize: e.maxTeamSize?.toString() || '4',
          });
          if (e.poster && !duplicateId) {
            setPosterPreview(e.poster);
          }
        })
        .catch((err: any) => {
          toast.error(err.message || 'Failed to load event');
          router.push(user?.role === 'admin' ? '/admin' : '/organizer');
        })
        .finally(() => setLoadingEvent(false));
    }
  }, [editId, duplicateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('coordinates.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, coordinates: { ...prev.coordinates, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Poster must be under 5 MB');
        return;
      }
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const removePoster = () => {
    setPoster(null);
    setPosterPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.venue) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!form.registrationDeadline) {
      toast.error('Registration deadline is required');
      return;
    }
    if (form.pricingType === 'paid' && (!form.price || parseFloat(form.price) <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }
    if (form.registrationType === 'external' && !form.externalLink) {
      toast.error('Please provide the external registration link');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('venue', form.venue);
      fd.append('maxParticipants', form.maxParticipants);
      fd.append('registrationType', form.registrationType);
      if (form.registrationType === 'external' && form.externalLink) {
        fd.append('externalLink', form.externalLink);
      }

      // Build ISO date string for the event date
      const dateStr = `${form.date}T${form.time}:00`;
      fd.append('date', dateStr);
      // Send time as separate field (backend requires it)
      fd.append('time', form.time);

      if (form.endDate && form.endTime) {
        fd.append('endDate', `${form.endDate}T${form.endTime}:00`);
        fd.append('endTime', form.endTime);
      }
      if (form.registrationDeadline) {
        fd.append('registrationDeadline', form.registrationDeadline);
      }
      if (form.tags) {
        fd.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim())));
      }
      if (form.coordinates.lat && form.coordinates.lng) {
        fd.append('locationCoordinates', JSON.stringify({
          lat: parseFloat(form.coordinates.lat),
          lng: parseFloat(form.coordinates.lng),
        }));
      }

      // Organizer info — send as flat fields
      fd.append('organizerName', form.organizerName);
      fd.append('organizerDepartment', form.organizerDepartment);
      fd.append('organizerEmail', form.organizerEmail);

      // Pricing
      fd.append('pricingType', form.pricingType);
      if (form.pricingType === 'paid') {
        fd.append('price', form.price);
        fd.append('priceType', form.priceType);
      }

      // Team config
      fd.append('participationType', form.participationType);
      if (form.participationType === 'team') {
        fd.append('minTeamSize', form.minTeamSize);
        fd.append('maxTeamSize', form.maxTeamSize);
      }

      if (poster) fd.append('poster', poster);

      if (isEditMode) {
        await api.events.update(editId!, fd);
        toast.success('Event updated successfully!');
      } else {
        await api.events.create(fd);
        toast.success(
          user?.role === 'admin'
            ? 'Event created & published!'
            : 'Event submitted for approval!'
        );
      }
      router.push(user?.role === 'admin' ? '/admin' : '/organizer');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit event');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-4">You need to sign in to create an event.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={user?.role === 'admin' ? '/admin' : '/organizer'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">
        {isEditMode ? 'Edit Event' : duplicateId ? 'Duplicate Event' : 'Submit New Event'}
      </h1>
      <p className="text-gray-400 mb-8">
        {isEditMode
          ? 'Update the event details below.'
          : duplicateId
            ? 'Review and publish this copied draft as a new event.'
          : user?.role === 'admin'
            ? 'Create an event. It will be published immediately.'
            : 'Fill in the details below. Your event will be reviewed by an admin before publishing.'}
      </p>

      {loadingEvent ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Poster Upload */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-primary-400" /> Event Poster
          </h2>
          {posterPreview ? (
            <div className="relative rounded-xl overflow-hidden max-w-md">
              <img src={posterPreview} alt="Poster preview" className="w-full h-64 object-cover" />
              <button
                type="button"
                onClick={removePoster}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary-400 mx-auto mb-3 transition-colors" />
              <p className="text-gray-400">Click to upload poster</p>
              <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP — Max 5 MB</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePoster}
            className="hidden"
          />
        </div>

        {/* Basic Info */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" /> Basic Information
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Event Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. TechXplore 2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="input-field resize-none"
                placeholder="Describe your event in detail..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="AI, Workshop, Beginner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" /> Date &amp; Time
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Start Time *
              </label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Registration Deadline *</label>
              <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="input-field" required />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" /> Venue
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Venue Name *</label>
              <input name="venue" value={form.venue} onChange={handleChange} className="input-field" placeholder="e.g. CSE Seminar Hall" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                <input name="coordinates.lat" value={form.coordinates.lat} onChange={handleChange} className="input-field" placeholder="12.9716" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                <input name="coordinates.lng" value={form.coordinates.lng} onChange={handleChange} className="input-field" placeholder="77.5946" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary-400" /> Pricing
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, pricingType: 'free' }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.pricingType === 'free'
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                🎉 Free Event
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, pricingType: 'paid' }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.pricingType === 'paid'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" /> Paid Event
              </button>
            </div>

            {form.pricingType === 'paid' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. 200"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price Type</label>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, priceType: 'per_person' }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        form.priceType === 'per_person'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Per Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, priceType: 'per_team' }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        form.priceType === 'per_team'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Per Team
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participation & Team Config */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary-400" /> Participation Type
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, participationType: 'individual' }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.participationType === 'individual'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Individual
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, participationType: 'team' }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.participationType === 'team'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <UsersRound className="w-3.5 h-3.5" /> Team
              </button>
            </div>

            {form.participationType === 'team' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Team Size</label>
                  <input
                    type="number"
                    name="minTeamSize"
                    value={form.minTeamSize}
                    onChange={handleChange}
                    className="input-field"
                    min="2"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Team Size</label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    value={form.maxTeamSize}
                    onChange={handleChange}
                    className="input-field"
                    min="2"
                    max="20"
                  />
                </div>
                <p className="col-span-2 text-xs text-gray-500">
                  Team sizes include the team leader. During registration, participants will add their teammates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Registration Settings */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" /> Registration Settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Participants</label>
              <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Registration Type</label>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, registrationType: 'internal' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                    form.registrationType === 'internal'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Internal
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, registrationType: 'external' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                    form.registrationType === 'external'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> External
                </button>
              </div>
            </div>
          </div>

          {form.registrationType === 'external' && (
            <div className="col-span-2 animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> External Registration Link *
              </label>
              <input
                name="externalLink"
                value={form.externalLink}
                onChange={handleChange}
                className="input-field"
                placeholder="https://forms.google.com/... or https://unstop.com/..."
                type="url"
              />
              <p className="text-[11px] text-gray-600 mt-1">
                Students will be redirected to this link to register. Opens in a new tab.
              </p>
            </div>
          )}
        </div>

        {/* Organizer Info */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4">Organizer Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input name="organizerName" value={form.organizerName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <input name="organizerDepartment" value={form.organizerDepartment} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input name="organizerEmail" value={form.organizerEmail} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link href={user?.role === 'admin' ? '/admin' : '/organizer'} className="btn-ghost">Cancel</Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary min-w-[160px] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Saving…' : 'Submitting…'}
              </>
            ) : (
              <>
                {isEditMode ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {isEditMode ? 'Save Changes' : user?.role === 'admin' ? 'Create & Publish' : 'Submit Event'}
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
