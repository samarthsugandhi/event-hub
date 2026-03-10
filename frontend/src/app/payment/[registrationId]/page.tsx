'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, CreditCard, Smartphone, Landmark, Wallet,
  CheckCircle, Shield, Lock, IndianRupee, UsersRound,
  Calendar, MapPin, Clock, AlertCircle, Loader2, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';

interface PaymentData {
  paymentId: string;
  registrationId: string;
  amount: number;
  status: string;
  transactionId?: string;
  paidAt?: string;
}

interface EventInfo {
  title: string;
  date: string;
  venue: string;
  time?: string;
  pricingType: string;
  price: number;
  priceType: string;
  participationType: string;
}

interface RegistrationInfo {
  registrationId: string;
  name: string;
  email: string;
  teamName?: string;
  teamMembers?: { name: string; email: string; usn: string }[];
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [registration, setRegistration] = useState<RegistrationInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mock form fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (registrationId) {
      initPayment();
    }
  }, [registrationId]);

  const initPayment = async () => {
    try {
      // First try to get existing payment
      try {
        const existingRes = await api.payments.getByRegistration(registrationId);
        if (existingRes.data && existingRes.data.status === 'completed') {
          setPayment(existingRes.data);
          setEvent(existingRes.event);
          setRegistration(existingRes.registration);
          setPaymentSuccess(true);
          setLoading(false);
          return;
        }
      } catch {
        // No existing payment, create one
      }

      // Initiate new payment
      const res = await api.payments.initiate(registrationId);
      setPayment(res.data);
      setEvent(res.event);

      // Get registration details
      try {
        const regRes = await api.payments.getByRegistration(registrationId);
        setRegistration(regRes.registration);
      } catch {
        // Registration info not critical
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!payment) return;

    // Basic validation
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g., name@upi)');
      return;
    }
    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (!cardExpiry || !cardCvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setProcessing(true);

    // Simulate payment processing with a realistic delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await api.payments.confirm(payment.paymentId, selectedMethod);
      setPayment(res.data);
      setPaymentSuccess(true);
      toast.success('Payment successful! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading payment details…</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Payment Not Found</h2>
          <p className="text-gray-400 mb-4">Could not find payment details for this registration.</p>
          <Link href="/events" className="btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  // Payment Success View
  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-card text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">Your payment has been confirmed</p>

          {/* Receipt */}
          <div className="glass rounded-2xl p-6 mb-6 text-left border border-green-500/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-2xl" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                <Receipt className="w-3 h-3" /> {payment.paymentId}
              </span>
              <span className="badge bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">PAID</span>
            </div>

            {event && (
              <h3 className="text-lg font-bold text-white mb-4">{event.title}</h3>
            )}

            <div className="space-y-2 text-sm">
              {registration && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid By</span>
                  <span className="text-white">{registration.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-white font-bold text-lg">₹{payment.amount}</span>
              </div>
              {event?.priceType === 'per_team' && registration?.teamName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Team</span>
                  <span className="text-white">{registration.teamName}</span>
                </div>
              )}
              {event?.priceType === 'per_team' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Type</span>
                  <span className="text-purple-300">Team Payment (Leader Pays)</span>
                </div>
              )}
              {payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-white font-mono text-xs">{payment.transactionId}</span>
                </div>
              )}
              {payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid On</span>
                  <span className="text-white">{new Date(payment.paidAt).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {registration?.teamMembers && registration.teamMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-gray-500 mb-2">Team Members Covered</p>
                <div className="space-y-1">
                  <span className="text-xs text-white block">✓ {registration.name} (Leader)</span>
                  {registration.teamMembers.map((m, i) => (
                    <span key={i} className="text-xs text-white block">✓ {m.name} ({m.usn})</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href={`/register/${(event as any)?._id || ''}?pass=${registrationId}`}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              View Event Pass
            </Link>
            <Link href="/events" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Payment Form View
  const paymentMethods: { id: PaymentMethodType; icon: any; label: string; desc: string }[] = [
    { id: 'upi', icon: Smartphone, label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
    { id: 'card', icon: CreditCard, label: 'Card', desc: 'Credit / Debit Card' },
    { id: 'netbanking', icon: Landmark, label: 'Net Banking', desc: 'All Banks' },
    { id: 'wallet', icon: Wallet, label: 'Wallet', desc: 'Paytm, Amazon Pay' },
  ];

  const isTeamPayment = event?.priceType === 'per_team';
  const teamSize = registration?.teamMembers ? registration.teamMembers.length + 1 : 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      {/* Payment Header */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Secure Payment</h1>
            <p className="text-sm text-gray-400">Complete your event registration</p>
          </div>
        </div>

        {/* Event Summary */}
        {event && (
          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-white mb-2">{event.title}</h3>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary-400" /> {formatDate(event.date)}</span>
              {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-400" /> {event.time}</span>}
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400" /> {event.venue}</span>
            </div>
          </div>
        )}

        {/* Amount Summary */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">Registration Fee</span>
            <span className="text-white">₹{payment.amount}</span>
          </div>

          {isTeamPayment && registration && (
            <>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <UsersRound className="w-3.5 h-3.5 text-purple-400" />
                  Team: {registration.teamName}
                </span>
                <span className="text-purple-300">{teamSize} members</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3">
                <p className="text-xs text-purple-300 text-center">
                  💡 Team payment — Leader pays ₹{payment.amount} for the entire team
                </p>
              </div>
            </>
          )}

          <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
            <span className="text-white font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary-300 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {payment.amount}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
              }`}
            >
              <method.icon className={`w-5 h-5 mb-2 ${
                selectedMethod === method.id ? 'text-primary-400' : 'text-gray-500'
              }`} />
              <p className={`text-sm font-medium ${
                selectedMethod === method.id ? 'text-white' : 'text-gray-300'
              }`}>
                {method.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
            </button>
          ))}
        </div>

        {/* Payment Form based on method */}
        <div className="space-y-4">
          {selectedMethod === 'upi' && (
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">UPI ID</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="input-field pl-11"
                  placeholder="yourname@upi"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">Enter your UPI ID (GPay, PhonePe, Paytm, etc.)</p>
            </div>
          )}

          {selectedMethod === 'card' && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="input-field"
                  placeholder="Name on card"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="input-field pl-11 font-mono"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="input-field font-mono"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="input-field font-mono"
                    placeholder="•••"
                    maxLength={3}
                  />
                </div>
              </div>
            </>
          )}

          {selectedMethod === 'netbanking' && (
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Select Bank</label>
              <select className="input-field appearance-none">
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="bob">Bank of Baroda</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="canara">Canara Bank</option>
              </select>
            </div>
          )}

          {selectedMethod === 'wallet' && (
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Select Wallet</label>
              <div className="grid grid-cols-2 gap-3">
                {['Paytm', 'Amazon Pay', 'PhonePe Wallet', 'Freecharge'].map((w) => (
                  <button
                    key={w}
                    className="glass rounded-lg p-3 text-sm text-gray-300 hover:bg-white/[0.06] transition-colors text-left"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="btn-primary w-full flex items-center justify-center gap-2 !py-4 text-base"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ₹{payment.amount}
          </>
        )}
      </button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <Shield className="w-3.5 h-3.5" />
        <span>Secure payment • 256-bit SSL encryption • Prototype Mode</span>
      </div>

      {/* Prototype Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-xs text-yellow-300/80 text-center">
          ⚠️ This is a payment prototype. No real money will be charged.
          In production, this would integrate with Razorpay or Stripe.
        </p>
      </div>
    </div>
  );
}
