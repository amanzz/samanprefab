"use client";

import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm, { type ProductFormHandle } from "@/components/products/ProductForm";
import Button from "@/components/ui/button/Button";

type SaveState = 'idle' | 'loading' | 'success' | 'error';

export default function NewProductPage() {
  const router  = useRouter();
  const formRef = useRef<ProductFormHandle>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const handleSaveStateChange = useCallback((s: SaveState) => setSaveState(s), []);

  const publishBtnLabel =
    saveState === 'loading' ? 'Publishing…' :
    saveState === 'success' ? '✓ Published!' :
    saveState === 'error'   ? 'Retry' :
    'Publish Product';

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
            <span className="font-medium text-gray-600 dark:text-gray-300">New Product</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Product</h1>
              <p className="mt-1 text-sm text-gray-500">Fill in the tabs below and click Publish when ready.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')} type="button">
                Cancel
              </Button>
              <Button
                size="sm"
                type="button"
                disabled={saveState === 'loading'}
                onClick={() => formRef.current?.submit()}
                className={`min-w-[140px] transition-colors ${saveState === 'success' ? 'bg-success-500 hover:bg-success-600' : ''}`}
              >
                <span className="flex items-center gap-2">
                  {saveState === 'loading' && (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle className="opacity-25" cx="12" cy="12" r="10" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {publishBtnLabel}
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
