'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/admin/ToastProvider';
import { api } from '@/lib/api';
import type { Redirect, NotFoundLog } from '@/lib/types/admin';
import { Card } from '@/components/admin/ui/Card';
import Button from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import Input from '@/components/admin/ui/Input';
import Select from '@/components/admin/ui/Select';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

const CODE_OPTS = [{ value: '301', label: '301 Permanent' }, { value: '302', label: '302 Temporary' }];

interface RedirectForm { fromPath: string; toPath: string; statusCode: string; }
const EMPTY_FORM: RedirectForm = { fromPath: '', toPath: '', statusCode: '301' };

export default function RedirectsPage() {
  const toast = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [notFound, setNotFound] = useState<NotFoundLog[]>([]);
  const [loadingR, setLoadingR] = useState(true);
  const [loadingN, setLoadingN] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; edit?: Redirect }>({ open: false });
  const [form, setForm] = useState<RedirectForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<RedirectForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const fetchRedirects = useCallback(async () => {
    setLoadingR(true);
    try { const r = await api.get<Redirect[]>('/redirects'); setRedirects(r.data); }
    catch { setRedirects([]); }
    finally { setLoadingR(false); }
  }, []);

  const fetchNotFound = useCallback(async () => {
    setLoadingN(true);
    try { const r = await api.get<NotFoundLog[]>('/not-found-log'); setNotFound(r.data); }
    catch { setNotFound([]); }
    finally { setLoadingN(false); }
  }, []);

  useEffect(() => { fetchRedirects(); fetchNotFound(); }, [fetchRedirects, fetchNotFound]);

  function openCreate(prefill?: Partial<RedirectForm>) {
    setForm({ ...EMPTY_FORM, ...prefill });
    setErrors({});
    setSaveErr('');
    setModal({ open: true });
  }

  function openEdit(r: Redirect) {
    setForm({ fromPath: r.fromPath, toPath: r.toPath, statusCode: String(r.statusCode) });
    setErrors({});
    setSaveErr('');
    setModal({ open: true, edit: r });
  }

  function validate() {
    const e: Partial<RedirectForm> = {};
    if (!form.fromPath.trim()) e.fromPath = 'Required';
    else if (!form.fromPath.startsWith('/')) e.fromPath = 'Must start with /';
    if (!form.toPath.trim()) e.toPath = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true); setSaveErr('');
    const body = { fromPath: form.fromPath, toPath: form.toPath, statusCode: Number(form.statusCode) };
    try {
      if (modal.edit) { await api.put(`/redirects/${modal.edit.id}`, body); toast.success('Redirect updated'); }
      else { await api.post('/redirects', body); toast.success('Redirect created'); }
      setModal({ open: false });
      fetchRedirects();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setSaveErr(msg);
      toast.error(msg);
    }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this redirect?')) return;
    try { await api.del(`/redirects/${id}`); setRedirects((p) => p.filter((r) => r.id !== id)); toast.success('Redirect deleted'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); }
  }

  async function handleToggle(r: Redirect) {
    try {
      await api.put(`/redirects/${r.id}`, { fromPath: r.fromPath, toPath: r.toPath, statusCode: r.statusCode, isActive: !r.isActive });
      setRedirects((p) => p.map((x) => x.id === r.id ? { ...x, isActive: !r.isActive } : x));
    } catch { /* silent */ }
  }

  async function handleResolve(log: NotFoundLog) {
    try {
      await api.patch(`/not-found-log/${log.id}/resolve`, {});
      setNotFound((p) => p.map((x) => x.id === log.id ? { ...x, resolvedAt: new Date().toISOString() } : x));
      toast.success('Marked as resolved');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Redirects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage URL redirects and monitor 404 errors</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>Add Redirect</Button>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Active Redirects</h2>
          <p className="text-sm text-gray-500">301/302 redirect rules ({redirects.length} total)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{['From', 'To', 'Type', 'Hits', 'Active', 'Actions'].map((c) => <th key={c} className={thCls}>{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingR ? <TableSkeleton rows={4} /> : redirects.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No redirects yet.</td></tr>
              ) : redirects.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.fromPath}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.toPath}</td>
                  <td className="px-4 py-3"><Badge variant="info">{r.statusCode}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{r.hitCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(r)}
                      className={['h-5 w-9 rounded-full transition-colors relative', r.isActive ? 'bg-green-500' : 'bg-gray-200'].join(' ')}>
                      <span className={['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', r.isActive ? 'left-4' : 'left-0.5'].join(' ')} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">404 Error Log</h2>
            <p className="text-sm text-gray-500">Unresolved 404s — click to create a redirect</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{['Path', 'Hits', 'Last Seen', 'Status', 'Actions'].map((c) => <th key={c} className={thCls}>{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingN ? <TableSkeleton rows={4} /> : notFound.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No 404 logs.</td></tr>
              ) : notFound.map((n) => (
                <tr key={n.id} className={['hover:bg-gray-50', n.resolvedAt ? 'opacity-50' : ''].join(' ')}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{n.path}</td>
                  <td className="px-4 py-3 text-gray-600">{n.count}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(n.lastSeenAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {n.resolvedAt ? <Badge variant="success">Resolved</Badge> : <Badge variant="warning">Open</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {!n.resolvedAt && (
                      <div className="flex gap-1">
                        <button onClick={() => openCreate({ fromPath: n.path })} title="Create redirect"
                          className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleResolve(n)} title="Mark resolved"
                          className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors text-xs font-medium">
                          ✓
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.edit ? 'Edit Redirect' : 'Add Redirect'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal({ open: false })}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{modal.edit ? 'Save Changes' : 'Create'}</Button>
        </>}>
        {saveErr && <p className="text-sm text-red-600 mb-3">{saveErr}</p>}
        <div className="space-y-4">
          <Input label="From Path" required value={form.fromPath} error={errors.fromPath}
            onChange={(e) => setForm((p) => ({ ...p, fromPath: e.target.value }))} placeholder="/old-page" />
          <Input label="To Path" required value={form.toPath} error={errors.toPath}
            onChange={(e) => setForm((p) => ({ ...p, toPath: e.target.value }))} placeholder="/new-page" />
          <Select label="Redirect Type" options={CODE_OPTS} value={form.statusCode}
            onChange={(e) => setForm((p) => ({ ...p, statusCode: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
