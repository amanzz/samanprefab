import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types/public';
import { Search, Filter, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Prefab Products | Portable Cabins, Houses, Offices | Saman Prefab',
  description: 'Browse our complete range of prefabricated structures. Portable cabins, site offices, prefab houses, warehouses & more. Get instant quotes.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'All Prefab Products | Saman Prefab',
    description: 'Browse portable cabins, site offices, prefab houses & warehouses.',
    url: 'https://samanprefab.com/products',
  },
};

// JSON-LD for Product Collection
const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Prefab Products',
  description: 'Complete range of prefabricated structures from Saman Prefab',
  url: 'https://samanprefab.com/products',
};

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getProductsData(searchParams: ProductsPageProps['searchParams']) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  
  try {
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '50');
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    const [productsRes, categoriesRes] = await Promise.all([
      api.get<Product[]>(`/products?${params}`),
      api.get<ProductCategory[]>('/categories'),
    ]);

    return {
      products: productsRes.data,
      categories: categoriesRes.data,
    };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, categories } = await getProductsData(searchParams);
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Our Products</h1>
            <p className="text-blue-100 text-lg">
              Browse our complete range of high-quality prefabricated structures. 
              From portable cabins to warehouses, we have solutions for every need.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Filter className="h-4 w-4 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Search</h3>
                <form className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedCategory && (
                    <input type="hidden" name="category" value={selectedCategory} />
                  )}
                </form>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
              </p>
              {selectedCategory && (
                <Link
                  href="/products"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <Link
                  href="/products"
                  className="inline-flex items-center text-blue-600 font-medium"
                >
                  View all products
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote CTA */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-gray-600 mb-6">
            We can customize any product to meet your specific requirements. 
            Get in touch for a personalized quote.
          </p>
          <Link
            href="/get-quote"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Request Custom Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const categorySlug = product.category?.slug || 'general';
  const priceDisplay = product.priceMin
    ? `₹${product.priceMin.toLocaleString('en-IN')}${product.priceMax ? ` - ₹${product.priceMax.toLocaleString('en-IN')}` : ''}`
    : 'Price on request';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images[0],
    offers: product.priceMin ? {
      '@type': 'Offer',
      price: product.priceMin,
      priceCurrency: 'INR',
      availability: product.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <Link href={`/products/${categorySlug}/${product.slug}`}>
          <div className="aspect-[4/3] bg-gray-100 relative">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9" />
                </svg>
              </div>
            )}
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/products/${categorySlug}/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {product.shortDescription || 'High-quality prefabricated structure'}
          </p>
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                <span key={key} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {value}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">{priceDisplay}</span>
            <span className="text-xs text-gray-400 capitalize">{product.priceUnit}</span>
          </div>
          <Link
            href={`/products/${categorySlug}/${product.slug}`}
            className="mt-3 block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </>
  );
}
