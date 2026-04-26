'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Zap, Pencil, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/admin/ToastProvider';
import { api } from '@/lib/api';
import type { CitySeoPage, City, ProductCategory } from '@/lib/types/admin';
import { Card } from '@/components/admin/ui/Card';
import Button from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import Input from '@/components/admin/ui/Input';
import Select from '@/components/admin/ui/Select';
import Pagination from '@/components/admin/ui/Pagination';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

const STATUS_OPTS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const seoVariant = (s: string) =>
  ({ published: 'success', draft: 'warning', archived: 'default' } as Record<string, 'success' | 'warning' | 'default'>)[s] ?? 'default';

export default function SeoPage() {
  const toast = useToast();
  const [pages, setPages] = useState<CitySeoPage[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const [editModal, setEditModal] = useState<{ open: boolean; target?: CitySeoPage }>({ open: false });
  const [editForm, setEditForm] = useState({ status: 'draft', metaTitle: '', metaDescription: '', priority: '50' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [bulkModal, setBulkModal] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkCityIds, setBulkCityIds] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [bulkActivating, setBulkActivating] = useState(false);
  const [bulkResult, setBulkResult] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get<CitySeoPage[]>(`/city-seo-pages?page=${page}&limit=${LIMIT}`);
      setPages(r.data);
      if (r.meta) { setTotalPages(r.meta.totalPages); setTotal(r.meta.total); }
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPages(); }, [fetchPages]);
  useEffect(() => {
    api.get<City[]>('/cities').then((r) => setCities(r.data)).catch(() => {});
    api.get<ProductCategory[]>('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  function openEdit(p: CitySeoPage) {
    setEditForm({ status: p.status, metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '', priority: String(p.priority) });
    setEditModal({ open: true, target: p });
  }

  async function handleEditSave() {
    if (!editModal.target) return;
    setSavingEdit(true);
    try {
      await api.put(`/city-seo-pages/${editModal.target.id}`, {
        status: editForm.status,
        metaTitle: editForm.metaTitle || undefined,
        metaDescription: editForm.metaDescription || undefined,
        priority: Number(editForm.priority),
      });
      setEditModal({ open: false });
      fetchPages();
      toast.success('SEO page updated');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSavingEdit(false); }
  }

  async function handleBulkActivate() {
    if (!bulkCategoryId || !bulkCityIds.length) return;
    setBulkActivating(true);
    setBulkResult('');
    try {
      const r = await api.post<{ created: number; skipped: number }>('/city-seo-pages/bulk-activate', { categoryId: bulkCategoryId, cityIds: bulkCityIds });
      const msg = `Created ${r.data.created} pages, skipped ${r.data.skipped} existing.`;
      setBulkResult(msg);
      toast.success(msg);
      fetchPages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      setBulkResult(msg);
      toast.error(msg);
    } finally { setBulkActivating(false); }
  }

  const published = pages.filter((p) => p.status === 'published').length;
  const draft = pages.filter((p) => p.status === 'draft').length;
  const noindex = pages.filter((p) => p.noIndex).length;
  const filteredCities = cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  const catOpts = categories.map((c) => ({ value: c.id, label: c.name }));
  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">City SEO Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage city × product landing pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Zap className="h-4 w-4" />} onClick={() => { setBulkResult(''); setBulkCityIds([]); setBulkModal(true); }}>Bulk Activate</Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setBulkModal(true)}>New Page</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', value: total, color: 'text-gray-900' },
          { label: 'Published', value: published, color: 'text-green-600' },
          { label: 'Draft', value: draft, color: 'text-amber-600' },
          { label: 'No-Index', value: noindex, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={['text-2xl font-bold mt-1', stat.color].join(' ')}>{loading ? '—' : stat.value}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{['Slug', 'City', 'Category', 'Status', 'Priority', 'Actions'].map((c) => <th key={c} className={thCls}>{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? <TableSkeleton rows={6} /> : pages.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No SEO pages yet. Use Bulk Activate.</td></tr>
              ) : pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[280px] truncate">{p.slug}</td>
                  <td className="px-4 py-3 text-gray-700">{p.city?.name ?? p.cityId.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-700">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3"><Badge variant={seoVariant(p.status)}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{p.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50"><Pencil className="h-3.5 w-3.5" /></button>
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </Card>

      <Modal open={editModal.open} onClose={() => setEditModal({ open: false })} title="Edit SEO Page"
        description={editModal.target?.slug}
        footer={<>
          <Button variant="secondary" onClick={() => setEditModal({ open: false })}>Cancel</Button>
          <Button loading={savingEdit} onClick={handleEditSave}>Save</Button>
        </>}>
        <div className="space-y-4">
          <Select label="Status" options={STATUS_OPTS} value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} />
          <Input label="Priority (0–100)" type="number" value={editForm.priority} onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))} />
          <Input label="Meta Title" value={editForm.metaTitle} onChange={(e) => setEditForm((p) => ({ ...p, metaTitle: e.target.value }))} />
          <Input label="Meta Description" value={editForm.metaDescription} onChange={(e) => setEditForm((p) => ({ ...p, metaDescription: e.target.value }))} />
        </div>
      </Modal>

      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Activate City Pages" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setBulkModal(false)}>Cancel</Button>
          <Button loading={bulkActivating} disabled={!bulkCategoryId || !bulkCityIds.length}
            onClick={handleBulkActivate}>
            Generate {bulkCityIds.length} Pages
          </Button>
        </>}>
        <div className="space-y-4">
          {bulkResult && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{bulkResult}</p>}
          <Select label="Category *" options={catOpts} placeholder="Select category" value={bulkCategoryId}
            onChange={(e) => setBulkCategoryId(e.target.value)} required />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Select Cities ({bulkCityIds.length} selected)</p>
            <Input placeholder="Search cities…" value={citySearch} onChange={(e) => setCitySearch(e.target.value)} />
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredCities.map((c) => (
                <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={bulkCityIds.includes(c.id)}
                    onChange={(e) => setBulkCityIds(e.target.checked ? [...bulkCityIds, c.id] : bulkCityIds.filter((id) => id !== c.id))}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm text-gray-700">{c.name}{c.state ? `, ${c.state}` : ''}</span>
                </label>
              ))}
              {filteredCities.length === 0 && <p className="px-3 py-4 text-sm text-gray-400 text-center">No cities found</p>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
