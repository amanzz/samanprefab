"use client";

import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product.types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  onClearFilters?: () => void;
}

function ProductSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
      aria-hidden="true"
    >
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-4/5" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/5" />
        {/* Price & CTA */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-3" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found matching your criteria.',
  onClearFilters,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        aria-label="Loading products"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center" role="status" aria-live="polite">
        {/* Empty icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M8 11h6M11 8v6" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
          {emptyMessage}
        </p>

        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Clear Filters &amp; Show All
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      role="list"
      aria-label={`${products.length} products`}
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
