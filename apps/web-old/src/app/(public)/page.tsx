import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types/public';
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  Truck, 
  Award,
  Phone,
  ArrowRight,
  Star
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Saman Prefab - Leading Prefabricated Structure Manufacturer in India',
  description: 'Buy high-quality prefabricated cabins, houses, site offices, and warehouses. Fast delivery across India. ISI Certified. Get a free quote today!',
  alternates: {
    canonical: '/',
  },
};

// JSON-LD Schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Saman Prefab',
  url: 'https://samanprefab.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://samanprefab.com/products?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Saman Prefab',
  url: 'https://samanprefab.com',
  logo: 'https://samanprefab.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-98765-43210',
    contactType: 'sales',
    availableLanguage: ['English', 'Hindi'],
  },
};

async function getHomepageData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get<Product[]>('/products?status=published&limit=6'),
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

export default async function HomePage() {
  const { products, categories } = await getHomepageData();

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                ISI Certified Manufacturer
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Premium Prefab Structures{' '}
                <span className="text-blue-200">Delivered Fast</span>
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 max-w-lg">
                Portable cabins, prefab houses, site offices & warehouses. 
                Built to last, delivered across India in 14-28 days.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/919876543210"
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp Quote
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>14-28 Days Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Pan India Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>10+ Years Warranty</span>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[500px] hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl" />
              <div className="h-full w-full bg-blue-800/30 rounded-2xl border border-white/10 flex items-center justify-center">
                <div className="text-center text-blue-200">
                  <div className="h-32 w-32 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Prefab Building Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
              <div className="text-sm text-gray-600">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">10yr</div>
              <div className="text-sm text-gray-600">Warranty</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">ISI</div>
              <div className="text-sm text-gray-600">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      {categories.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our wide range of prefabricated structures designed for various applications
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products/${category.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <svg className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description || `High-quality ${category.name.toLowerCase()} for your needs`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
                <p className="text-gray-600">Our most popular prefabricated structures</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center text-blue-600 font-medium"
              >
                View All Products
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Saman Prefab?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We deliver quality, speed, and reliability for all your prefabricated structure needs
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<Clock className="h-8 w-8" />}
              title="Fast Delivery"
              description="14-28 days delivery across India. Quick setup and installation."
            />
            <BenefitCard
              icon={<Shield className="h-8 w-8" />}
              title="10-Year Warranty"
              description="Complete structural warranty with annual maintenance support."
            />
            <BenefitCard
              icon={<Award className="h-8 w-8" />}
              title="ISI Certified"
              description="All materials meet BIS standards. Quality you can trust."
            />
            <BenefitCard
              icon={<Truck className="h-8 w-8" />}
              title="Pan India Service"
              description="Delivery and installation available in all major cities."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-gray-600">Trusted by 500+ businesses across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Rajesh Sharma"
              company="Sharma Constructions"
              location="Pune, Maharashtra"
              content="Excellent quality portable cabins delivered on time. The team was professional and the installation was seamless. Highly recommended!"
              rating={5}
            />
            <TestimonialCard
              name="Priya Patel"
              company="Patel Industries"
              location="Ahmedabad, Gujarat"
              content="We ordered 5 site offices for our construction project. The quality exceeded our expectations. Great value for money."
              rating={5}
            />
            <TestimonialCard
              name="Amit Kumar"
              company="Kumar Logistics"
              location="Bangalore, Karnataka"
              content="The prefab warehouse solution saved us months of construction time. Durable structure with excellent finish."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Get a free quote for your prefabricated structure. Our team will help you 
            choose the right solution for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/get-quote"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </a>
          </div>
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

  return (
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
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">{priceDisplay}</span>
          <span className="text-xs text-gray-400 capitalize">{product.priceUnit}</span>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-500/20 rounded-xl mb-4 text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  name,
  company,
  location,
  content,
  rating,
}: {
  name: string;
  company: string;
  location: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-4 leading-relaxed">&ldquo;{content}&rdquo;</p>
      <div className="border-t border-gray-100 pt-4">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">{company}</div>
        <div className="text-sm text-gray-400">{location}</div>
      </div>
    </div>
  );
}
