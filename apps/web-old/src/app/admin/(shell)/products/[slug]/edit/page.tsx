'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types/admin';
import ProductForm from '../../ProductForm';
import { Skeleton } from '@/components/admin/ui/Skeleton';

export default function EditProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Product>(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch((e) => setError(e.message ?? 'Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-3xl space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
    </div>
  );

  if (error || !product) return (
    <div className="text-center py-16 text-gray-500">{error || 'Product not found'}</div>
  );

  return <ProductForm product={product} />;
}
