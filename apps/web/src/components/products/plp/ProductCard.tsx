"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product.types';
import { API_CONFIG } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `₹${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `₹${(price / 1_000).toFixed(0)}k`;
  return `₹${price}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rawImage = product.mainImage || product.gallery?.[0] || '';
  const hasImage = Boolean(rawImage.trim());
  const imageSrc = hasImage ? API_CONFIG.assetUrl(rawImage) : '';

  const hasPrice = (product.priceMin || 0) > 0 || (product.priceMax || 0) > 0;
  const hasPriceRange =
    hasPrice &&
    (product.priceMin || 0) > 0 &&
    (product.priceMax || 0) > 0 &&
    product.priceMin !== product.priceMax;

  const priceNode = product.priceText ? (
    <span className="text-gray-900 dark:text-white font-bold text-lg">{product.priceText}</span>
  ) : !hasPrice ? (
    <span className="text-brand-600 dark:text-brand-400 font-bold text-lg">Get Quote</span>
  ) : hasPriceRange ? (
    <span className="text-gray-900 dark:text-white font-bold text-lg">
      {formatPrice(product.priceMin)} – {formatPrice(product.priceMax)}
    </span>
  ) : (
    <span className="text-gray-900 dark:text-white font-bold text-lg">
      {formatPrice(product.priceMin || product.priceMax || 0)}
    </span>
  );

  return (
    <article
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full"
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-900">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        {product.categoryId && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold shadow-sm">
            {product.categoryId.replace(/-/g, ' ')}
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-6">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-5">
            <div>{priceNode}</div>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-gray-900 dark:text-white font-semibold text-sm transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
