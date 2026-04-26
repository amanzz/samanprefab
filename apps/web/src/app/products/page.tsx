import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsPageContent from './ProductsPageContent';
import JsonLd from '@/components/shared/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Portable Cabins in India | Premium Prefab Solutions',
    description: 'India\'s leading manufacturer of high-quality prefabricated portable cabins, office buildings, security posts, and modular structures. Custom designs, fast delivery, pan-India service.',
    keywords: ['portable cabin', 'prefab cabin', 'modular cabin', 'office cabin', 'worker housing', 'prefabricated structures', 'modular buildings', 'portable office', 'security cabin'],
    openGraph: {
      title: 'Premium Prefab Solutions | Saman Prefab',
      description: 'High-performance prefabricated structures for industrial, commercial, and residential needs across India.',
      images: [{ url: '/assets/images/hero.png' }],
    },
    alternates: {
      canonical: '/products',
    },
  };
}

export default function ProductsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://samanprefab.com/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://samanprefab.com/products' },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <aside className="hidden lg:block lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-96 animate-pulse" />
              </aside>
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-16 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }>
        <ProductsPageContent />
      </Suspense>
    </>
  );
}
