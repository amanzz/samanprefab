"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { categoryService, Category } from '@/services/category.service';
import { Product } from '@/types/product.types';

import SortBar from '@/components/products/plp/SortBar';
import ProductGrid from '@/components/products/plp/ProductGrid';
import FiltersSidebar from '@/components/products/plp/FiltersSidebar';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export default function ProductsPageContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // URL-synced filter state
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activePriceRange, setActivePriceRange] = useState(searchParams.get('price') || 'all');
  const [activeAttributes, setActiveAttributes] = useState<Record<string, string>>({});
  const [currentSort, setCurrentSort] = useState(searchParams.get('sort') || 'popular');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load attributes from URL on mount
  useEffect(() => {
    const attrs: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        attrs[key.replace('attr_', '')] = value;
      }
    });
    if (Object.keys(attrs).length > 0) {
      setActiveAttributes(attrs);
    }
  }, [searchParams]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data (rate limit now increased on API server)
        const productsRes = await productService.getAll({ status: 'published' });
        setProducts(productsRes.items || []);

        const categoriesRes = await categoryService.getAll();
        setCategories(categoriesRes.items || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sync filters to URL
  const updateUrl = useCallback((
    category: string,
    price: string,
    sort: string,
    query: string,
    attrs: Record<string, string>
  ) => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (price !== 'all') params.set('price', price);
    if (sort !== 'popular') params.set('sort', sort);
    if (query) params.set('q', query);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value) params.set(`attr_${key}`, value);
    });
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateUrl(activeCategory, activePriceRange, currentSort, searchQuery, activeAttributes);
    }
  }, [activeCategory, activePriceRange, currentSort, searchQuery, activeAttributes, updateUrl]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.shortDescription || '').toLowerCase().includes(query) ||
          (product.sku || '').toLowerCase().includes(query)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((product) => product.categoryId === activeCategory);
    }

    // Price range filter
    const priceRanges = [
      { id: 'all', min: 0, max: Infinity },
      { id: 'low', min: 0, max: 50000 },
      { id: 'mid', min: 50000, max: 200000 },
      { id: 'high', min: 200000, max: 500000 },
      { id: 'luxury', min: 500000, max: Infinity },
    ];
    const range = priceRanges.find((r) => r.id === activePriceRange);
    if (range) {
      result = result.filter((product) => {
        const minPrice = product.priceMin || 0;
        return minPrice >= range.min && minPrice <= range.max;
      });
    }

    // Attribute filters
    if (Object.keys(activeAttributes).length > 0) {
      result = result.filter((product) => {
        if (!product.attributes || !Array.isArray(product.attributes)) return false;
        const productAttrs = product.attributes as any[];
        return Object.entries(activeAttributes).some(([attrName, value]) =>
          productAttrs.some(
            (pa) => (pa.label === attrName || pa.name === attrName) && pa.value === value
          )
        );
      });
    }

    return result;
  }, [products, searchQuery, activeCategory, activePriceRange, activeAttributes]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (currentSort) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.priceMin || 0) - (b.priceMin || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.priceMin || 0) - (a.priceMin || 0));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        break;
    }
    return sorted;
  }, [filteredProducts, currentSort]);

  // Toggle attribute filter
  const toggleAttribute = (attrName: string, value: string) => {
    setActiveAttributes((prev) => {
      const updated = { ...prev };
      if (updated[attrName] === value) {
        delete updated[attrName];
      } else {
        updated[attrName] = value;
      }
      return updated;
    });
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActivePriceRange('all');
    setActiveAttributes({});
    setSearchQuery('');
  };

  const activeFilterCount = Object.keys(activeAttributes).length + (activeCategory !== 'all' ? 1 : 0) + (activePriceRange !== 'all' ? 1 : 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-20 md:pb-24 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-brand-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-600 text-white text-xs font-black uppercase tracking-widest mb-6 border border-brand-500 shadow-sm">
              Industrial Grade Structures
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Engineered for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Maximum Performance</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-medium">
              Premium prefabricated portable cabins and office buildings. Designed for rapid deployment, extreme durability, and cost-efficiency across India.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a href="#quote-section" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 text-white font-black uppercase tracking-widest text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20">
                Request Quote
              </a>
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-black uppercase tracking-widest text-sm hover:bg-gray-700 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden sticky top-[80px] z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 py-3">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {sortedProducts.length} Products
          </span>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.7v6.2l8-9.7V3z" />
            </svg>
            Filters
            <span className="bg-brand-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {activeFilterCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FiltersSidebar
                products={products}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                activePriceRange={activePriceRange}
                setActivePriceRange={setActivePriceRange}
                activeAttributes={activeAttributes}
                toggleAttribute={toggleAttribute}
                onClearAll={clearFilters}
                isSidebarOpen={mobileFilterOpen}
                toggleSidebar={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            ...(activeCategory !== 'all' ? [{ label: categories.find((c) => c.id === activeCategory)?.name || 'Category' }] : []),
          ]}
          className="mb-4"
        />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 self-start">
            <div className="sticky top-24">
              <FiltersSidebar
                products={products}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                activePriceRange={activePriceRange}
                setActivePriceRange={setActivePriceRange}
                activeAttributes={activeAttributes}
                toggleAttribute={toggleAttribute}
                onClearAll={clearFilters}
                isSidebarOpen={true}
                toggleSidebar={() => { }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 self-start">
            {/* Product Count & Sort */}
            <SortBar
              totalCount={sortedProducts.length}
              currentSort={currentSort}
              setSort={setCurrentSort}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />

            {/* Product Grid */}
            <ProductGrid
              products={sortedProducts}
              isLoading={loading}
              emptyMessage={
                searchQuery
                  ? `No products found matching "${searchQuery}". Try different keywords.`
                  : 'No products found in this category. Check back soon for updates!'
              }
              onClearFilters={clearFilters}
            />

            {/* Pagination Placeholder */}
            {sortedProducts.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Need a custom solution? <Link href="/contact" className="text-brand-600 font-bold hover:underline">Request Custom Design</Link>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed">Previous</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-600 text-white shadow-lg shadow-brand-600/20">1</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">2</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">3</button>
                  <span className="text-gray-400 text-sm px-2">...</span>
                  <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Hero Cards */}
        <div className="mt-24">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-3">
                    {category.name}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{category.name} Cabins</h3>
                  <p className="text-gray-400 text-sm mb-4">{category.description?.slice(0, 100)}...</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-brand-400">
                    View Products
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div id="quote-section" className="mt-24 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Transform Your Space?</h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10">
              Get a custom prefab solution tailored to your exact requirements. Professional design, premium materials, and expert installation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+919876543210" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg hover:bg-gray-50 transition-all hover:shadow-xl">
                Call for Free Consultation
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-500/20">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
