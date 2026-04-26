'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/admin/ToastProvider';
import { api } from '@/lib/api';
import type { Quote } from '@/lib/types/admin';
import { Card } from '@/components/admin/ui/Card';
import Pagination from '@/components/admin/ui/Pagination';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import Textarea from '@/components/admin/ui/Textarea';

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const;
const NEXT_STATUS: Record<string, string[]> = {
  new: ['contacted', 'spam'],
  contacted: ['qualified', 'won', 'lost'],
  qualified: ['won', 'lost'],
  won: [],
  lost: [],
  spam: [],
};

function formatINR(n?: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function QuotesPage() {
  const toast = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesTarget, setNotesTarget] = useState<Quote | null>(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const LIMIT = 20;

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get<Quote[]>(`/quotes?${params}`);
      setQuotes(res.data);
      if (res.meta) { setTotalPages(res.meta.totalPages); setTotal(res.meta.total); }
    } catch { setQuotes([]); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  async function handleStatusChange(quote: Quote, newStatus: string) {
    setUpdatingStatus(quote.id);
    try {
      await api.patch(`/quotes/${quote.id}/status`, { status: newStatus });
      setQuotes((prev) => prev.map((q) => q.id === quote.id ? { ...q, status: newStatus as Quote['status'] } : q));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Status update failed');
    } finally { setUpdatingStatus(null); }
  }

  async function handleSaveNotes() {
    if (!notesTarget) return;
    setSavingNotes(true);
    try {
      await api.patch(`/quotes/${notesTarget.id}/notes`, { notes: notesText });
      setQuotes((prev) => prev.map((q) => q.id === notesTarget.id ? { ...q, notes: notesText } : q));
      setNotesTarget(null);
      toast.success('Notes saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save notes');
    } finally { setSavingNotes(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quote Inbox</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer enquiries</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={['rounded-full px-4 py-1.5 text-xs font-medium transition-colors border capitalize',
              s === statusFilter ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'].join(' ')}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Ref ID', 'Customer', 'Phone', 'City', 'Est. Value', 'Status', 'Date', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? <TableSkeleton rows={8} /> : quotes.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No quotes found.</td></tr>
              ) : quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{q.refId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{q.customerName}</p>
                    {q.customerEmail && <p className="text-xs text-gray-400 truncate max-w-[180px]">{q.customerEmail}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{q.customerPhone}</td>
                  <td className="px-4 py-3 text-gray-600">{q.customerCity ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{formatINR(q.estimatedTotal)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={q.status}
                      disabled={updatingStatus === q.id || !NEXT_STATUS[q.status]?.length}
                      onChange={(e) => handleStatusChange(q, e.target.value)}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60">
                      <option value={q.status}>{q.status}</option>
                      {NEXT_STATUS[q.status]?.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Notes" onClick={() => { setNotesTarget(q); setNotesText(q.notes ?? ''); }}
                        className={['p-1.5 rounded transition-colors', q.notes ? 'text-brand-600 hover:bg-brand-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'].join(' ')}>
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      <a href={`${API_BASE}/quotes/${q.refId}/pdf`} target="_blank" rel="noreferrer" title="Download PDF"
                        className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </Card>

      <Modal open={!!notesTarget} onClose={() => setNotesTarget(null)} title="Quote Notes"
        description={notesTarget ? `#${notesTarget.refId} — ${notesTarget.customerName}` : ''}
        footer={<>
          <Button variant="secondary" onClick={() => setNotesTarget(null)}>Cancel</Button>
          <Button loading={savingNotes} onClick={handleSaveNotes}>Save Notes</Button>
        </>}>
        <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)}
          rows={5} placeholder="Add internal notes about this lead…" />
      </Modal>
    </div>
  );
}
