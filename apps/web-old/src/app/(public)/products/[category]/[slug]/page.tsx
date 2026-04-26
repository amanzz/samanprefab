import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types/public';
import { 
  Phone, 
  ArrowLeft, 
  Clock,
  Shield,
  Award,
  Truck,
  ChevronRight
} from 'lucide-react';

interface ProductPageProps {
  params: {
    category: string;
    slug: string;
  };
}

async function getProduct(category: string, slug: string): Promise<Product | null> {
  try {
    const res = await api.get<Product>(`/products/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.category, params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | Saman Prefab',
    };
  }

  return {
    title: product.metaTitle || `${product.name} | Saman Prefab`,
    description: product.metaDescription || product.shortDescription || `Buy ${product.name} from Saman Prefab. High-quality prefabricated structures with fast delivery across India.`,
    alternates: {
      canonical: `/products/${params.category}/${params.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || '',
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.category, params.slug);

  if (!product || product.status !== 'published') {
    notFound();
  }

  const priceDisplay = product.priceMin
    ? `₹${product.priceMin.toLocaleString('en-IN')}${product.priceMax ? ` - ₹${product.priceMax.toLocaleString('en-IN')}` : ''}`
    : 'Price on request';

  // Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Saman Prefab',
    },
    offers: product.priceMin ? {
      '@type': 'Offer',
      price: product.priceMin,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Saman Prefab',
      },
    } : undefined,
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://samanprefab.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://samanprefab.com/products',
      },
      product.category?.name && {
        '@type': 'ListItem',
        position: 3,
        name: product.category.name,
        item: `https://samanprefab.com/products/${product.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: product.category?.name ? 4 : 3,
        name: product.name,
        item: `https://samanprefab.com/products/${params.category}/${params.slug}`,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/products/${product.category.slug}`} className="hover:text-blue-600">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <svg className="h-24 w-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9" />
                  </svg>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={img}
                      alt={`${product.name} - Image ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Link
                  href={`/products/${product.category.slug}`}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{priceDisplay}</span>
              <span className="text-gray-500 capitalize">{product.priceUnit}</span>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-lg text-gray-600">{product.shortDescription}</p>
            )}

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">14-28 Days Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">10-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">ISI Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Pan India Delivery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={`/get-quote?product=${product.slug}`}
                className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Get Quote
              </Link>
              <a
                href="https://wa.me/919876543210"
                className="inline-flex justify-center items-center px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            {/* Contact Direct */}
            <div className="flex items-center gap-2 text-gray-600 pt-2">
              <Phone className="h-4 w-4" />
              <span>or call</span>
              <a href="tel:+919876543210" className="font-semibold text-blue-600 hover:underline">
                +91 98765 43210
              </a>
            </div>

            {/* Lead Time */}
            {product.leadTimeDays && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">Lead time:</span>
                  <span className="text-gray-600 ml-1">
                    {product.leadTimeDays.min}-{product.leadTimeDays.max} days
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Specifications */}
        <div className="grid lg:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              {product.description ? (
                <div
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-600">
                  This {product.name.toLowerCase()} is built with high-quality materials 
                  and designed for durability and comfort. Contact us for detailed specifications 
                  and customization options.
                </p>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="bg-gray-50 rounded-xl p-6">
                <dl className="space-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <dt className="text-sm text-gray-500 capitalize">{key}</dt>
                      <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-600">
                Specifications available on request.
                <Link
                  href={`/get-quote?product=${product.slug}`}
                  className="block mt-4 text-blue-600 font-medium hover:underline"
                >
                  Request Details
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Cities SEO */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {product.name} Available In
          </h2>
          <div className="flex flex-wrap gap-3">
            {['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata'].map((city) => (
              <Link
                key={city}
                href={`/prefab-${product.category?.slug || 'portable-cabin'}-in-${city.toLowerCase()}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
