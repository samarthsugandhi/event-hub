'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Event } from '@/types';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle, Camera, Keyboard, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    department: string;
    usn: string;
    registrationId: string;
    checkedInAt: string;
  };
}

interface QRPayload {
  registrationId?: string;
  eventId?: string;
}

export default function ScannerPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [recentScans, setRecentScans] = useState<VerificationResult[]>([]);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<any>(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (mode === 'camera' && selectedEvent) {
      initScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop?.().catch(() => {});
      }
    };
  }, [mode, selectedEvent]);

  const loadEvents = async () => {
    try {
      const res = await api.events.list({ limit: '100' });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      if (scannerRef.current) {
        await scannerRef.current.clear();
      }

      setScannerReady(false);
      scanLockRef.current = false;

      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      }, false);

      scanner.render(
        (decodedText: string) => {
          handleQRScan(decodedText);
        },
        (error: string) => {
          // Scan error - ignore
        }
      );

      scannerRef.current = scanner;
      setScannerReady(true);
    } catch (err) {
      console.error('Scanner init error:', err);
      toast.error('Failed to initialize camera');
    }
  };

  const handleQRScan = async (data: string) => {
    if (scanLockRef.current) return;

    try {
      scanLockRef.current = true;

      let parsed: QRPayload | null = null;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { registrationId: data.trim() };
      }

      const registrationId = parsed?.registrationId?.trim();
      const eventId = parsed?.eventId?.trim();

      if (!registrationId) {
        toast.error('QR code does not include a registration ID');
        return;
      }

      if (eventId && eventId !== selectedEvent) {
        setSelectedEvent(eventId);
        await verifyRegistration(registrationId, eventId);
        return;
      }

      await verifyRegistration(registrationId, eventId || selectedEvent);
    } catch {
      toast.error('Invalid QR code format');
    } finally {
      setTimeout(() => {
        scanLockRef.current = false;
      }, 1200);
    }
  };

  const verifyRegistration = async (registrationId: string, eventOverride?: string) => {
    const eventId = eventOverride || selectedEvent;

    if (!eventId) {
      toast.error('Please select an event first');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const res = await api.registrations.verify({
        registrationId,
        eventId,
      });

      const verResult: VerificationResult = {
        success: true,
        message: res.message,
        data: res.data,
      };

      setResult(verResult);
      setRecentScans((prev) => [verResult, ...prev.slice(0, 9)]);
      toast.success(`✅ ${res.data.name} checked in!`);
    } catch (err: any) {
      const verResult: VerificationResult = {
        success: false,
        message: err.message || 'Verification failed',
      };
      setResult(verResult);
      toast.error(err.message);
    } finally {
      setVerifying(false);
      setManualId('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      verifyRegistration(manualId.trim());
    }
  };

  if (!user || !['admin', 'organizer'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <QrCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Scanner Access Required</h2>
          <p className="text-gray-500">Sign in as admin or organizer to use the scanner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">QR Entry Verification</h1>
        <p className="text-gray-400">Scan participant QR codes to verify attendance</p>
      </div>

      {/* Event Selection */}
      <div className="glass-card max-w-lg mx-auto">
        <label className="text-sm text-gray-400 mb-2 block">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-field"
        >
          <option value="">Choose event to scan for...</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Tip: if the QR contains an eventId, the scanner will auto-detect the correct event.
        </p>
      </div>

      {selectedEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner */}
          <div className="glass-card">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === 'camera' ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white' : 'glass text-gray-400'
                }`}
              >
                <Camera className="w-4 h-4" /> Camera Scan
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === 'manual' ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white' : 'glass text-gray-400'
                }`}
              >
                <Keyboard className="w-4 h-4" /> Manual Entry
              </button>
            </div>

            {mode === 'camera' ? (
              <div>
                <div id="qr-reader" className="rounded-xl overflow-hidden aurora-border bg-black/20" />
                <p className="text-center text-xs text-gray-500 mt-3">
                  {scannerReady ? 'Point camera at the participant&apos;s QR code' : 'Starting camera scanner...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Enter Registration ID (e.g. BV-A1B2C3D4)"
                    className="input-field pl-11"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying || !manualId.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Verify & Check In
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Result & Recent Scans */}
          <div className="space-y-6">
            {/* Current Result */}
            {result && (
              <div className={`glass-card border-2 ${
                result.success ? 'border-green-500/30' : 'border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.success ? (
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Check-in Successful' : 'Verification Failed'}
                    </h3>
                    <p className="text-sm text-gray-400">{result.message}</p>
                  </div>
                </div>

                {result.data && (
                  <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="text-white font-medium">{result.data.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Department</span>
                      <span className="text-white">{result.data.department}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">USN</span>
                      <span className="text-white font-mono">{result.data.usn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reg. ID</span>
                      <span className="text-primary-400 font-mono">{result.data.registrationId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className="glass-card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Check-ins ({recentScans.filter((s) => s.success).length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentScans.map((scan, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                      {scan.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-white flex-1">
                        {scan.data?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {scan.data?.registrationId || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
