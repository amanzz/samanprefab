"use client";

import React, { useState, useMemo } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/services/category.service';
import { Product } from '@/types/product.types';

interface FiltersSidebarProps {
  products: Product[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activePriceRange: string;
  setActivePriceRange: (range: string) => void;
  activeAttributes: Record<string, string>;
  toggleAttribute: (attrId: string, value: string) => void;
  onClearAll: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function FiltersSidebar({
  products,
  activeCategory,
  setActiveCategory,
  activePriceRange,
  setActivePriceRange,
  activeAttributes,
  toggleAttribute,
  onClearAll,
  isSidebarOpen,
  toggleSidebar
}: FiltersSidebarProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.items || [];

  // Extract unique attribute values from products
  const allAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};

    products.forEach((product) => {
      if (product.attributes && Array.isArray(product.attributes)) {
        (product.attributes as any[]).forEach((attr) => {
          const attrName = attr.label || attr.name || 'Attributes';
          if (!attrs[attrName]) {
            attrs[attrName] = new Set();
          }
          if (attr.value) {
            attrs[attrName].add(attr.value);
          }
        });
      }
    });

    return Object.entries(attrs).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }));
  }, [products]);

  // Price range options
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'low', label: 'Under ₹50k', min: 0, max: 50000 },
    { id: 'mid', label: '₹50k - ₹2L', min: 50000, max: 200000 },
    { id: 'high', label: '₹2L - ₹5L', min: 200000, max: 500000 },
    { id: 'luxury', label: 'Above ₹5L', min: 500000, max: Infinity },
  ];

  // Filter products by current selections
  const filteredCount = useMemo(() => {
    if (activeCategory === 'all' && activePriceRange === 'all' && Object.keys(activeAttributes).length === 0) {
      return products.length;
    }

    return products.filter((product) => {
      // Category filter
      if (activeCategory !== 'all' && product.categoryId !== activeCategory) {
        return false;
      }

      // Price range filter
      if (activePriceRange !== 'all') {
        const range = priceRanges.find((r) => r.id === activePriceRange);
        if (range && range.min !== undefined) {
          const minPrice = product.priceMin || 0;
          if (minPrice < range.min || minPrice > (range.max !== Infinity ? range.max : range.max)) {
            return false;
          }
        }
      }

      // Attribute filters
      if (Object.keys(activeAttributes).length > 0) {
        if (product.attributes && Array.isArray(product.attributes)) {
          const productAttrs = product.attributes as any[];
          const hasMatch = Object.entries(activeAttributes).some(([attrName, value]) => {
            return productAttrs.some(
              (pa) =>
                (pa.label === attrName || pa.name === attrName) &&
                pa.value === value
            );
          });
          if (!hasMatch) return false;
        } else {
          return false;
        }
      }

      return true;
    }).length;
  }, [products, activeCategory, activePriceRange, activeAttributes]);

  const handleCategoryClick = (cat: Category | { id: string }) => {
    setActiveCategory(cat.id);
  };

  const handleClearFilters = () => {
    onClearAll();
  };

  const getCategoryBadge = (catId: string) => {
    const category = categories.find((c) => c.id === catId);
    if (activeCategory === catId) {
      return <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow-md">✓</span>;
    }
    if (category) {
      return <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold flex items-center justify-center">{category.name.charAt(0)}</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Filters
          <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {filteredCount}
          </span>
        </h3>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Filter Sections */}
      <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-4">
        {/* Category Filter */}
        <section>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
            </svg>
            Product Categories
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={() => handleCategoryClick({ id: 'all' })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="font-medium text-sm">All Categories</span>
              {activeCategory === 'all' && (
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getCategoryBadge(category.id)}
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {products.filter((p) => p.categoryId === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Price Filter */}
        <section>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Price Range
          </h4>
          <div className="space-y-1.5">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setActivePriceRange(range.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  activePriceRange === range.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className={`text-sm font-medium ${
                  activePriceRange === range.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {range.label}
                </span>
                {activePriceRange === range.id && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Attribute Filters */}
        {allAttributes.length > 0 && (
          <section>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Specifications
            </h4>
            <div className="space-y-5">
              {allAttributes.map((attrGroup) => (
                <div key={attrGroup.name}>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    {attrGroup.name}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {attrGroup.values.map((value) => {
                      const isActive = activeAttributes[attrGroup.name] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => toggleAttribute(attrGroup.name, value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
                            isActive
                              ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Filters Display */}
        {(activeCategory !== 'all' || activePriceRange !== 'all' || Object.keys(activeAttributes).length > 0) && (
          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                  {categories.find((c) => c.id === activeCategory)?.name || 'Category'}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="hover:text-red-500"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activePriceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                  {priceRanges.find((r) => r.id === activePriceRange)?.label}
                  <button
                    onClick={() => setActivePriceRange('all')}
                    className="hover:text-red-500"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {Object.entries(activeAttributes).map(([name, value]) => (
                <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                  {name}: {value}
                  <button
                    onClick={() => toggleAttribute(name, '')}
                    className="hover:text-red-500"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-xs font-medium text-red-500 hover:text-red-600 mt-1"
              >
                Clear all
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
