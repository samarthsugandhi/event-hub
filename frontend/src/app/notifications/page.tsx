'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Bell, BellOff, Check, Calendar, Users, AlertCircle,
  Megaphone, Clock, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const ICON_MAP: Record<string, any> = {
  event_published: Calendar,
  registration_open: Users,
  registration_confirmed: CheckCircle,
  event_reminder: Clock,
  event_update: AlertCircle,
  event_cancelled: BellOff,
  attendance_marked: Check,
  announcement: Megaphone,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.list();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.notifications.read(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => api.notifications.read(n._id))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to see notifications</h2>
          <Link href="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-400" /> Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card text-center py-16">
          <BellOff className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-600 text-sm mt-1">You&apos;ll be notified about events and registrations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = ICON_MAP[notification.type] || Bell;
            return (
              <div
                key={notification._id}
                onClick={() => !notification.read && markRead(notification._id)}
                className={`glass-card flex items-start gap-4 cursor-pointer transition-all ${
                  notification.read
                    ? 'opacity-60'
                    : 'border-l-2 border-l-primary-500'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.read
                    ? 'bg-white/5'
                    : 'bg-primary-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${notification.read ? 'text-gray-500' : 'text-primary-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-600 mt-2">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
