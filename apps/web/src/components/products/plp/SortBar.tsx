"use client";

import React, { useState, useCallback } from 'react';

interface SortBarProps {
  totalCount: number;
  currentSort: string;
  setSort: (sort: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'latest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

export default function SortBar({
  totalCount,
  currentSort,
  setSort,
  onSearch,
  searchQuery,
}: SortBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      onSearch(value);
    },
    [onSearch]
  );

  const clearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  return (
    <div className="mb-6" role="search" aria-label="Product filters and sorting">
      {/* Desktop sort bar */}
      <div className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Result count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{' '}
          <strong className="font-bold text-gray-900 dark:text-white">{totalCount}</strong>{' '}
          {totalCount === 1 ? 'product' : 'products'}
        </p>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="plp-search-desktop"
              type="search"
              placeholder="Search products…"
              value={localSearch}
              onChange={handleSearchChange}
              aria-label="Search products"
              className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700 text-sm w-64 text-gray-900 dark:text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            <select
              id="plp-sort-desktop"
              value={currentSort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="appearance-none pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile sort bar */}
      <div className="md:hidden bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong className="font-bold text-gray-900 dark:text-white">{totalCount}</strong>{' '}
            products
          </p>
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            <select
              id="plp-sort-mobile"
              value={currentSort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="appearance-none pl-7 pr-5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id="plp-search-mobile"
            type="search"
            placeholder="Search products…"
            value={localSearch}
            onChange={handleSearchChange}
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {localSearch && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
