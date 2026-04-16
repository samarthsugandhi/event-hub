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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08]"
        style={{
          background: 'rgba(10, 10, 10, 0.84)',
          backdropFilter: 'blur(18px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] flex items-center justify-center shadow-lg shadow-black/20 group-hover:shadow-black/30 transition-all duration-300 group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">BEC Event Hub</span>
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
                <Link href="/notifications" className="relative rounded-lg p-2 transition-colors hover:bg-white/[0.05]">
                  <Bell className="w-5 h-5 text-[#B0B0B0]" />
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B1E2D] text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-sm text-[#B0B0B0] sm:block">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`hidden h-3.5 w-3.5 text-[#B0B0B0] transition-transform duration-200 sm:block ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl animate-scale-in"
                      style={{ background: 'rgba(17, 17, 17, 0.96)', backdropFilter: 'blur(20px)' }}
                    >
                      <div className="border-b border-white/[0.06] p-4">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="mt-0.5 truncate text-xs text-[#B0B0B0]">{user.email}</p>
                        <span className="mt-2 inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C6A75E]">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#B0B0B0] transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#B0B0B0] transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#8B1E2D] transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary !py-2 !px-4 flex items-center gap-1.5 text-sm">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-white/[0.06] lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5 text-[#B0B0B0]" /> : <Menu className="h-5 w-5 text-[#B0B0B0]" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 animate-slide-up border-b border-white/[0.06]"
            style={{ background: 'rgba(10, 10, 10, 0.96)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200',
                    pathname === link.href
                      ? 'border border-white/10 bg-white/[0.05] text-white'
                      : 'text-[#B0B0B0] hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link href="/login" className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white">
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
