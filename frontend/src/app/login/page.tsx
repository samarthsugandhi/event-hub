'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  Mail, Lock, User, Building, GraduationCap, ArrowRight,
  Zap, Shield, Eye, EyeOff, Hash
} from 'lucide-react';

type Mode = 'login' | 'register';
type RegisterRole = 'student' | 'faculty' | 'organizer' | 'visitor';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminField, setShowAdminField] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as RegisterRole,
    department: '',
    year: '',
    usn: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validate USN/CSN
  const validateUSN = (usn: string, year: string): string | null => {
    if (!usn && form.role !== 'student') return null; // Optional for non-students
    if (!usn && form.role === 'student') return 'USN/CSN is required for students';

    const usnUpper = usn.toUpperCase().trim();
    // 1st year CSN: 2025XXXXXX (10 digits starting with year)
    const csnRegex = /^20\d{8}$/;
    // 2nd+ year USN: 2BAXXXXXXX (starts with 2BA)
    const usnRegex = /^2BA\d{2}[A-Z]{2}\d{3}$/;

    if (year === '1') {
      if (!csnRegex.test(usnUpper)) {
        return 'Invalid CSN format. Expected: 2025XXXXXX (e.g., 2025010590)';
      }
    } else {
      if (!usnRegex.test(usnUpper) && !csnRegex.test(usnUpper)) {
        return 'Invalid USN format. Expected: 2BAXXXXXXX (e.g., 2BA23IS080)';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        // Admin secret check — if admin secret is entered, validate it
        if (showAdminField && adminSecret) {
          if (adminSecret !== 'BECVORTEX2026') {
            toast.error('Invalid admin access code');
            setLoading(false);
            return;
          }
        }

        await login(form.email, form.password);
        toast.success('Welcome back! 🎉');
        router.push('/');
      } else {
        // Registration validation
        if (form.role === 'student' && form.usn) {
          const usnError = validateUSN(form.usn, form.year);
          if (usnError) {
            toast.error(usnError);
            setLoading(false);
            return;
          }
        }

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department || undefined,
          year: form.year || undefined,
          usn: form.usn ? form.usn.toUpperCase().trim() : undefined,
        });
        toast.success('Account created! Welcome to BEC Event Hub 🚀');
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Authentication failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setForm((prev) => ({ ...prev, email, password }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-[#6b4f4f] flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">BEC Event Hub</span>
          </div>
          <h1 className="text-xl font-medium text-gray-300">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
        </div>

        {/* Tab Switch */}
        <div className="glass rounded-xl p-1 flex mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setShowAdminField(false); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === m
                  ? 'bg-primary-500/20 text-primary-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          {mode === 'register' && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field pl-11"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="input-field pl-11 pr-11"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Admin Secret Code (Login mode only) */}
          {mode === 'login' && (
            <div>
              {!showAdminField ? (
                <button
                  type="button"
                  onClick={() => setShowAdminField(true)}
                  className="text-xs text-gray-600 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" /> Admin access?
                </button>
              ) : (
                <div className="animate-fade-in">
                  <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Admin Access Code
                  </label>
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="input-field"
                    placeholder="Enter admin secret code"
                  />
                  <p className="text-[11px] text-gray-600 mt-1">Optional — only for admin accounts</p>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input-field pl-11 appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="organizer">Organizer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
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
                {form.role === 'student' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Year</label>
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                )}
              </div>

              {/* USN/CSN field for students */}
              {form.role === 'student' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    {form.year === '1' ? 'CSN (College Serial Number)' : 'USN (University Seat Number)'}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="usn"
                      value={form.usn}
                      onChange={handleChange}
                      className="input-field pl-11 uppercase"
                      placeholder={form.year === '1' ? '2025XXXXXX (e.g., 2025010590)' : '2BAXXXXXXX (e.g., 2BA23IS080)'}
                    />
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {form.year === '1'
                      ? 'Format: 2025 followed by 6 digits'
                      : 'Format: 2BA + year (2 digits) + branch (2 letters) + roll (3 digits)'}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 !mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        {mode === 'login' && (
          <div className="glass-card mt-4 animate-fade-in">
            <p className="text-gray-500 text-xs font-semibold mb-3 uppercase tracking-wider">Quick Login</p>
            <div className="space-y-2">
              {[
                { label: 'Admin', email: 'admin@becvortex.com', pw: 'admin123', color: 'text-red-400' },
                { label: 'Organizer', email: 'priya@becvortex.com', pw: 'organizer123', color: 'text-amber-400' },
                { label: 'Student', email: 'ananya@student.bec.edu', pw: 'student123', color: 'text-green-400' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => fillDemo(demo.email, demo.pw)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <span className={`text-xs font-semibold ${demo.color}`}>{demo.label}</span>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
                    {demo.email} / {demo.pw}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
