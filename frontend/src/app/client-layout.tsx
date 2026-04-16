'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
