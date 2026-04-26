"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/hooks/useProducts";
import ProductForm, { type ProductFormHandle } from "@/components/products/ProductForm";
import Button from "@/components/ui/button/Button";

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
  draft:     'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400',
  archived:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft:     'Draft',
  archived:  'Archived',
};

type SaveState = 'idle' | 'loading' | 'success' | 'error';

export default function EditProductPage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();
  const formRef = useRef<ProductFormHandle>(null);
  const { data: product, isLoading, error } = useProduct(id);

  const [saveState, setSaveState]     = useState<SaveState>('idle');
  const [lastSaved, setLastSaved]     = useState<Date | null>(null);
  // Display name is derived from product data, use product.id as key to force reset
  const displayName = product?.name ?? '';

  const handleSaveStateChange = useCallback((s: SaveState) => {
    setSaveState(s);
    if (s === 'success') setLastSaved(new Date());
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-sm font-medium text-gray-500">Loading product…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-medium text-error-500">Product not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/products')}>Back to Products</Button>
      </div>
    );
  }

  const rawStatus  = String((product as any).status || '').toLowerCase();
  const badgeCls   = STATUS_BADGE[rawStatus] || STATUS_BADGE.draft;
  const badgeLabel = STATUS_LABEL[rawStatus] || 'Draft';

  const saveBtnLabel =
    saveState === 'loading' ? 'Saving…' :
    saveState === 'success' ? '✓ Saved!' :
    saveState === 'error'   ? 'Retry' :
    'Save Changes';

  const formatLastSaved = (d: Date) => {
    const diffS = Math.round((Date.now() - d.getTime()) / 1000);
    if (diffS < 10)  return 'just now';
    if (diffS < 60)  return `${diffS}s ago`;
    if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">
        <div className="w-full px-6 lg:px-10 xl:px-12 py-4">
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/admin/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
            <span>›</span>
            <Link href="/admin/products" className="hover:text-brand-600 transition-colors">Products</Link>
            <span>›</span>
            <span className="max-w-[200px] truncate font-medium text-gray-600 dark:text-gray-300">{product.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="max-w-[500px] truncate text-2xl font-bold text-gray-900 dark:text-white">
                  {displayName || product.name}
                </h1>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeCls}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />{badgeLabel}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <p className="font-mono text-xs text-gray-400">{product.slug}</p>
                {lastSaved && (
                  <span className="text-xs text-success-500">
                    ✓ Saved {formatLastSaved(lastSaved)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')} type="button">
                ← Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => window.open(`/products/${product.slug}`, '_blank')}
              >
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                  Preview
                </span>
              </Button>
              <Button
                size="sm"
                type="button"
                disabled={saveState === 'loading'}
                onClick={() => formRef.current?.submit()}
                className={`min-w-[130px] transition-colors ${saveState === 'success' ? 'bg-success-500 hover:bg-success-600' : ''}`}
              >
                <span className="flex items-center gap-2">
                  {saveState === 'loading' && (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle className="opacity-25" cx="12" cy="12" r="10" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {saveBtnLabel}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────── */}
      <div className="w-full px-6 lg:px-10 xl:px-12 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <ProductForm
            ref={formRef}
            initialData={product}
            hideFooterButtons
            onSaveStateChange={handleSaveStateChange}
            onSuccess={() => router.push('/admin/products')}
            onCancel={() => router.push('/admin/products')}
          />
        </div>
      </div>
    </div>
  );
}
