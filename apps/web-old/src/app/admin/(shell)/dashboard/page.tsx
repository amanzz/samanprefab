'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Package, ArrowLeftRight, Image } from 'lucide-react';
import { api } from '@/lib/api';
import type { Quote } from '@/lib/types/admin';
import { StatCard } from '@/components/admin/ui/StatCard';
import { Card, CardHeader } from '@/components/admin/ui/Card';
import { Badge, quoteStatusBadge } from '@/components/admin/ui/Badge';

function formatINR(n?: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ quotes: 0, products: 0, redirects: 0, media: 0 });
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Quote[]>('/quotes?limit=1'),
      api.get('/products?limit=1&status=published'),
      api.get('/redirects?limit=1&isActive=true'),
      api.get('/media?limit=1'),
      api.get<Quote[]>('/quotes?limit=5&sort=createdAt&order=desc'),
    ]).then(([q, p, r, m, rq]) => {
      setStats({
        quotes: q.status === 'fulfilled' ? (q.value.meta?.total ?? 0) : 0,
        products: p.status === 'fulfilled' ? (p.value.meta?.total ?? 0) : 0,
        redirects: r.status === 'fulfilled' ? (r.value.meta?.total ?? 0) : 0,
        media: m.status === 'fulfilled' ? (m.value.meta?.total ?? 0) : 0,
      });
      if (rq.status === 'fulfilled') setRecentQuotes(rq.value.data as Quote[]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Quotes" value={loading ? '—' : stats.quotes}
          icon={<FileText className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" loading={loading} />
        <StatCard title="Published Products" value={loading ? '—' : stats.products}
          icon={<Package className="h-5 w-5 text-green-600" />} iconBg="bg-green-50" loading={loading} />
        <StatCard title="Active Redirects" value={loading ? '—' : stats.redirects}
          icon={<ArrowLeftRight className="h-5 w-5 text-orange-600" />} iconBg="bg-orange-50" loading={loading} />
        <StatCard title="Media Files" value={loading ? '—' : stats.media}
          icon={<Image className="h-5 w-5 text-purple-600" />} iconBg="bg-purple-50" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <CardHeader title="Recent Quotes" description="Latest 5 submissions" />
            <Link href="/admin/quotes" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
          ) : recentQuotes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No quotes yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{q.customerName}</p>
                    <p className="text-xs text-gray-400 font-mono">{q.refId}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-gray-700">{formatINR(q.estimatedTotal)}</span>
                    <Badge variant={quoteStatusBadge(q.status)}>{q.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick Actions" description="Common admin tasks" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Add Product', href: '/admin/products/new' },
              { label: 'View Quotes', href: '/admin/quotes' },
              { label: 'Manage SEO Pages', href: '/admin/seo' },
              { label: 'Upload Media', href: '/admin/media' },
              { label: 'Add Redirect', href: '/admin/redirects' },
              { label: 'Settings', href: '/admin/settings' },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
