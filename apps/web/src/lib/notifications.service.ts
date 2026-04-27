const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
})();

export type Notification = {
  id: string;
  type: 'lead' | 'quote' | 'product' | 'system';
  title: string;
  description?: string;
  data?: Record<string, any>;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
};

export async function getNotifications(limit = 5, offset = 0) {
  const response = await fetch(`${API_URL}/admin/notifications?limit=${limit}&offset=${offset}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  const data = await response.json();
  return data as { items: Notification[]; meta: { limit: number; offset: number; total: number; hasMore: boolean } };
}

export async function getUnreadCount() {
  const response = await fetch(`${API_URL}/admin/notifications/unread-count`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch unread count');
  const data = await response.json();
  return data.count as number;
}

export async function markAsRead(ids: string[]) {
  const response = await fetch(`${API_URL}/admin/notifications/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('Failed to mark as read');
  return response.json();
}

export async function markAllAsRead() {
  const response = await fetch(`${API_URL}/admin/notifications/mark-all-read`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to mark all as read');
  return response.json();
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day ago`;
  return date.toLocaleDateString();
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'lead':
      return '👤';
    case 'quote':
      return '💬';
    case 'product':
      return '📦';
    case 'system':
      return '⚠️';
    default:
      return '🔔';
  }
}
