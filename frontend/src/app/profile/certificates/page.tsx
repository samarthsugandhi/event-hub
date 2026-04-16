'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);
      try {
        const res = await api.certificates.list();
        setCertificates(res.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
          <Link href="/login" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-wrap py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Certificates</h1>
        <p className="text-[#B0B0B0] mt-1">Download certificates issued for attended events.</p>
      </div>

      <div className="glass-card">
        {loading ? (
          <p className="text-[#B0B0B0]">Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <p className="text-[#8f8f8f]">No certificates issued yet.</p>
        ) : (
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div key={cert._id} className="rounded-xl border border-white/[0.08] p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-medium">{cert.eventId?.title || 'Event'}</p>
                  <p className="text-xs text-[#AFAFAF] mt-1">
                    Certificate #{cert.certificateNumber} • Issued {formatDate(cert.issuedAt)}
                  </p>
                </div>
                <Link href={`/api/certificates/${cert._id}`} className="btn-secondary !py-1.5 text-xs">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
