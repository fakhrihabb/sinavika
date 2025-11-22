'use client';

import { useState, useEffect } from 'react';
import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import {
  Bell,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      const response = await fetch(
        `/api/notifications?userId=rumah-sakit-demo&recipientType=rumah_sakit&unreadOnly=${unreadOnly}`
      );
      const data = await response.json();

      if (data.notifications) {
        let filtered = data.notifications;
        if (filter === 'read') {
          filtered = data.notifications.filter(n => n.read);
        }
        setNotifications(filtered);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `/api/notifications?userId=rumah-sakit-demo&recipientType=rumah_sakit&countOnly=true`
      );
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'rumah-sakit-demo',
          recipientType: 'rumah_sakit',
        }),
      });

      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Hapus notifikasi ini?')) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'triage_new':
        return <User className={iconClass} />;
      case 'appointment_booked':
        return <Calendar className={iconClass} />;
      case 'appointment_cancelled':
        return <XCircle className={iconClass} />;
      case 'claim_pending':
        return <AlertCircle className={iconClass} />;
      case 'claim_approved':
        return <CheckCircle className={iconClass} />;
      case 'claim_rejected':
        return <XCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'triage_new':
      case 'appointment_booked':
        return 'bg-blue-100 text-blue-600';
      case 'claim_approved':
        return 'bg-green-100 text-green-600';
      case 'claim_pending':
        return 'bg-orange-100 text-orange-600';
      case 'claim_rejected':
      case 'appointment_cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLink = (notification) => {
    switch (notification.notification_type) {
      case 'triage_new':
      case 'appointment_booked':
        return notification.related_id
          ? `/rumah-sakit/antrian/${notification.related_id}`
          : '/rumah-sakit/antrian';
      case 'claim_pending':
      case 'claim_approved':
      case 'claim_rejected':
        return notification.related_id
          ? `/rumah-sakit/klaim/${notification.related_id}`
          : '/rumah-sakit/klaim';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RumahSakitNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Notifikasi
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : 'Semua notifikasi sudah dibaca'
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-[#03974a] text-white rounded-lg hover:bg-[#144782] transition-colors text-sm font-semibold"
              >
                <CheckCheck className="w-4 h-4" />
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'all'
                  ? 'border-[#03974a] text-[#03974a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'unread'
                  ? 'border-[#03974a] text-[#03974a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === 'read'
                  ? 'border-[#03974a] text-[#03974a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sudah Dibaca
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03974a] mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat notifikasi...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada notifikasi
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'Semua notifikasi sudah dibaca'
                : filter === 'read'
                ? 'Belum ada notifikasi yang dibaca'
                : 'Belum ada notifikasi untuk ditampilkan'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const actionLink = getActionLink(notification);
              const NotificationContent = (
                <div
                  className={`bg-white rounded-xl border ${
                    notification.read ? 'border-gray-200' : 'border-[#03974a] bg-blue-50/30'
                  } p-5 hover:shadow-md transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-lg ${getNotificationColor(notification.notification_type)}`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-[#03974a] rounded-full"></span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#03974a] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Tandai dibaca"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(notification.created_at)}
                        </span>
                        {actionLink && (
                          <span className="text-sm font-medium text-[#144782] group-hover:text-[#03974a] transition-colors">
                            Lihat Detail →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );

              return actionLink ? (
                <Link key={notification.id} href={actionLink}>
                  {NotificationContent}
                </Link>
              ) : (
                <div key={notification.id}>
                  {NotificationContent}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
