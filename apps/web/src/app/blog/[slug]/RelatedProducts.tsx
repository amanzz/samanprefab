import Image from "next/image";
import Link from "next/link";
import { API_CONFIG } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  shortDescription: string | null;
  priceDisplay: string | null;
  categoryName?: string;
}

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Explore Our Solutions
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Prefabricated structures that might interest you
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={API_CONFIG.assetUrl(product.mainImage || "/assets/images/hero.png")}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Category Badge */}
                {product.categoryName && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                      {product.categoryName}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                
                {product.shortDescription && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {product.priceDisplay ? (
                    <span className="text-brand-600 dark:text-brand-400 font-bold">
                      {product.priceDisplay}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Request Quote
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
