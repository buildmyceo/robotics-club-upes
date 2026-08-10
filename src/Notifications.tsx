import { useState, useEffect } from 'react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
}

interface NotificationsProps {
  myUserId: string;
}

export default function Notifications({ myUserId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    loadNotifications();

    // Listen for real-time updates when on the Notifications tab
    const handleNewNotification = () => {
      loadNotifications();
    };
    window.addEventListener('new_notification', handleNewNotification);

    return () => {
      window.removeEventListener('new_notification', handleNewNotification);
    };
  }, [myUserId]);

  const loadNotifications = () => {
    const key = `notifications_${myUserId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        // Sort descending by timestamp
        const parsed = JSON.parse(stored) as NotificationItem[];
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(parsed);
      } catch (e) {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  };

  const handleClearAll = () => {
    const confirmClear = window.confirm("Are you sure you want to clear all notifications?");
    if (confirmClear) {
      localStorage.removeItem(`notifications_${myUserId}`);
      setNotifications([]);
    }
  };

  const handleDismiss = (id: string) => {
    const key = `notifications_${myUserId}`;
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setNotifications(updated);
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">Stay updated with your latest alerts.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="font-medium text-gray-500">You're all caught up!</p>
            <p className="text-sm mt-1">No new notifications to show.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className="relative bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow group"
              >
                {/* Icon based on type */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'chat' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'}`}>
                  {notif.type === 'chat' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{notif.title}</h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                </div>

                {/* Dismiss Button */}
                <button 
                  onClick={() => handleDismiss(notif.id)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Dismiss notification"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
