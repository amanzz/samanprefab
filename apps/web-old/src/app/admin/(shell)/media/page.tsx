'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Search, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/ToastProvider';
import { api } from '@/lib/api';
import type { MediaFile } from '@/lib/types/admin';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function MediaPage() {
  const toast = useToast();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (folder) params.set('folder', folder);
      const r = await api.get<MediaFile[]>(`/media?${params}`);
      setMedia(r.data);
    } catch { setMedia([]); }
    finally { setLoading(false); }
  }, [folder]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        if (folder) fd.append('folder', folder);
        await fetch(`${API_BASE}/media`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
      }
      await fetchMedia();
      toast.success(`${Array.from(files).length} image(s) uploaded`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await api.del(`/media/${id}`);
      setMedia((p) => p.filter((m) => m.id !== id));
      toast.success('Image deleted');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); }
  }

  function copyUrl(file: MediaFile) {
    const url = file.urls?.['800w'] ?? file.url ?? '';
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function getDisplayUrl(file: MediaFile) {
    return file.urls?.['300w'] ?? file.urls?.['800w'] ?? file.url ?? '';
  }

  const filtered = media.filter((m) =>
    !search || (m.originalName ?? m.filename ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{media.length} files uploaded</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />
          <Button icon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            loading={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading…' : 'Upload Image'}
          </Button>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Drag & drop images here, or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">WebP variants generated automatically. Max 10 MB.</p>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Search by filename…" leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={folder} onChange={(e) => setFolder(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Folders</option>
          <option value="products">products</option>
          <option value="general">general</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Upload className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{search ? 'No images match your search.' : 'No images uploaded yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((file) => (
            <div key={file.id} className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              <div className="aspect-square overflow-hidden">
                <img src={getDisplayUrl(file)} alt={file.originalName ?? file.filename ?? ''}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{file.originalName ?? file.filename ?? 'image'}</p>
                {file.width && <p className="text-xs text-gray-400">{file.width}×{file.height}</p>}
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyUrl(file)} title="Copy URL"
                  className="h-6 w-6 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-brand-600">
                  {copiedId === file.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
                <button onClick={() => handleDelete(file.id)} title="Delete"
                  className="h-6 w-6 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
