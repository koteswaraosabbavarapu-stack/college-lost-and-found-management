import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Sparkles, FileCheck, PackageCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime, formatDateTime } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'MATCH' | 'CLAIM'

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    if (n.relatedItem) {
      navigate(`/items/${n.relatedItem._id || n.relatedItem}`);
    } else if (n.relatedClaim) {
      navigate(`/dashboard`);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'MATCH') return n.type === 'MATCH';
    if (filter === 'CLAIM') return n.type === 'CLAIM_STATUS' || n.type === 'HANDOVER';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'MATCH':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'CLAIM_STATUS':
        return <FileCheck className="w-5 h-5 text-amber-600" />;
      case 'HANDOVER':
        return <PackageCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding item matches, claim verifications, and handovers.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            type="button"
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold w-fit">
        {['ALL', 'UNREAD', 'MATCH', 'CLAIM'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl transition ${
              filter === tab
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab === 'UNREAD' ? 'Unread Only' : tab === 'MATCH' ? 'Matches' : 'Claims & Handovers'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-4 ${
                  !n.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="p-3 bg-slate-100 rounded-2xl shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {n.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 self-center" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description="You are all caught up! You will be notified when a match or claim update occurs."
          />
        )}
      </div>
    </div>
  );
};
