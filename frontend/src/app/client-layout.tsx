'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const onOffline = () => toast.error('You are offline. Some actions may fail.', { id: 'network-state' });
    const onOnline = () => toast.success('Back online.', { id: 'network-state' });

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    const analyticsTracker = async () => {
      try {
        const mappedStep =
          pathname === '/events' ? 'discover' :
          pathname.startsWith('/register') ? 'register' :
          pathname.startsWith('/payment') ? 'pay' :
          pathname.startsWith('/profile') ? 'attend' :
          'view_detail';

        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const trackedUserId = parsedUser?._id || parsedUser?.id;

        // Attempt to track via API
        const res = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: trackedUserId,
            eventId: pathname.includes('/events/') ? pathname.split('/')[2] : undefined,
            step: mappedStep,
            path: pathname,
            metadata: { deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop' },
          }),
        }).catch(() => null);

        // Fallback to localStorage if offline or API fails
        if (!res?.ok) {
          const key = 'bec-funnel-events';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const next = [...existing, { step: mappedStep, path: pathname, at: new Date().toISOString() }].slice(-200);
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        // Silently fail analytics tracking
      }
    };

    analyticsTracker();
  }, [pathname]);


  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1b4b',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '12px',
          },
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
