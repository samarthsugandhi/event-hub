'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  Home, Calendar, Map, BarChart3, Shield, Users, Bell,
  LogIn, LogOut, Menu, X, Zap, QrCode, ChevronDown, User,
  PlusCircle, LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Discover', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/map', label: 'Campus Map', icon: Map },
  ];

  const roleLinks = user
    ? [
        ...(user.role === 'admin'
          ? [
              { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
              { href: '/organizer/submit', label: 'Create Event', icon: PlusCircle },
              { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
              { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
            ]
          : []),
        ...(user.role === 'organizer'
          ? [
              { href: '/organizer', label: 'My Events', icon: Users },
              { href: '/organizer/submit', label: 'Submit', icon: PlusCircle },
              { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
            ]
          : []),
        ...(['student', 'faculty'].includes(user.role)
          ? [
              { href: '/organizer', label: 'My Events', icon: Users },
              { href: '/organizer/submit', label: 'Create Event', icon: PlusCircle },
            ]
          : []),
      ]
    : [];

  const allLinks = [...navLinks, ...roleLinks];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        style={{
          background: 'rgba(5, 5, 15, 0.8)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold gradient-text">BEC Vortex</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'nav-link flex items-center gap-1.5',
                    pathname === link.href && 'nav-link-active'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {roleLinks.length > 0 && (
                <>
                  <div className="w-px h-5 bg-white/[0.08] mx-1" />
                  {roleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'nav-link flex items-center gap-1.5',
                        pathname === link.href && 'nav-link-active'
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {user && (
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <Bell className="w-5 h-5 text-gray-400" />
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-300 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] animate-scale-in"
                      style={{ background: 'rgba(15, 12, 40, 0.95)', backdropFilter: 'blur(20px)' }}
                    >
                      <div className="p-4 border-b border-white/[0.06]">
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-primary-500/15 text-primary-300 text-[10px] font-semibold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 border-b border-white/[0.06] animate-slide-up"
            style={{ background: 'rgba(5, 5, 15, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200',
                    pathname === link.href
                      ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-primary-300 rounded-xl text-sm bg-primary-500/10 border border-primary-500/20 mt-3">
                  <LogIn className="w-5 h-5" /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
