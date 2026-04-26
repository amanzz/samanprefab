'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/components/admin/ToastProvider';
import { api } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types/admin';
import { Card } from '@/components/admin/ui/Card';
import Button from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import Pagination from '@/components/admin/ui/Pagination';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';
import Modal from '@/components/admin/ui/Modal';
import Input from '@/components/admin/ui/Input';
import Select from '@/components/admin/ui/Select';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const statusVariant = (s: string) =>
  ({ published: 'success', draft: 'warning', archived: 'default' } as Record<string, 'success' | 'warning' | 'default'>)[s] ?? 'default';

function formatINR(n?: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const LIMIT = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (search) params.set('search', search);
      const res = await api.get<Product[]>(`/products?${params}`);
      setProducts(res.data);
      if (res.meta) { setTotalPages(res.meta.totalPages); setTotal(res.meta.total); }
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, statusFilter, categoryFilter, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get<ProductCategory[]>('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.del(`/products/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      setDeleteError(msg);
      toast.error(msg);
    } finally { setDeleting(false); }
  }

  const catOpts = [{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product catalogue</p>
        </div>
        <Link href="/admin/products/new">
          <Button icon={<Plus className="h-4 w-4" />}>Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input placeholder="Search products…" leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="w-44">
          <Select options={STATUS_OPTS} value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
        </div>
        <div className="w-48">
          <Select options={catOpts} value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Price', 'Status', 'Updated', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? <TableSkeleton rows={6} /> : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No products found.</td></tr>
              ) : products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const img = p.images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                          {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[220px]">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cat?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {p.priceMin ? `${formatINR(p.priceMin)}${p.priceMax && p.priceMax !== p.priceMin ? ` – ${formatINR(p.priceMax)}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(p.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.slug}/edit`}>
                          <button className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </Card>

      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError(''); }} title="Delete Product"
        description={`"${deleteTarget?.name}" will be permanently deleted.`}
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </>}>
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
