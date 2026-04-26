"use client";

import React, { useState } from "react";
import { getNotifications, markAsRead, markAllAsRead, formatTimeAgo, getNotificationIcon, type Notification } from "@/lib/notifications.service";
import Button from "@/components/ui/button/Button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(50, 0);
      setNotifications(data.items);
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead([id]);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === "all" || n.type === filterType;
    const matchesRead = !unreadOnly || !n.read;
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-lg font-medium text-gray-500 animate-pulse">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-error-500 font-medium">Error loading notifications.</div>
        <p className="mt-2 text-xs text-gray-400">{error}</p>
        <Button onClick={loadNotifications} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Notifications</h2>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "All notifications read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
          >
            <option value="all">All Types</option>
            <option value="lead">Leads</option>
            <option value="quote">Quotes</option>
            <option value="product">Products</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="unreadOnly"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <label htmlFor="unreadOnly" className="text-sm text-gray-600 dark:text-gray-400">
            Unread only
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Time</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredNotifications.map((notification) => (
                <tr 
                  key={notification.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                    !notification.read ? "bg-blue-50/30 dark:bg-blue-500/5" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800 dark:text-white/90">{notification.title}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    {notification.description || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {!notification.read ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-500/10 dark:text-gray-400">
                        Read
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-brand-500 hover:text-brand-600 text-sm font-semibold"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p>No notifications match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
