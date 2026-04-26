import { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ProductCategory, City } from '@/lib/types/public';
import { 
  ArrowRight, 
  CheckCircle, 
  Phone,
  MapPin,
  Clock,
  Shield,
  Truck
} from 'lucide-react';

interface CityProductPageProps {
  params: {
    productSlug: string;
    citySlug: string;
  };
}

// Product category mapping for URL slugs
const PRODUCT_SLUGS: Record<string, string> = {
  'portable-cabin': 'Portable Cabin',
  'prefab-house': 'Prefab House',
  'labour-camp': 'Labour Camp',
  'site-office': 'Site Office',
  'porta-cabin': 'Porta Cabin',
  'school-building': 'School Building',
  'warehouse': 'Warehouse',
  'security-cabin': 'Security Cabin',
  'toilet-block': 'Toilet Block',
};

// Pre-render top city×product combinations at build time
export async function generateStaticParams() {
  // Top 20 cities × top 5 products = 100 pages pre-built
  const topCities = [
    'pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 
    'chennai', 'ahmedabad', 'kolkata', 'surat', 'jaipur',
    'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
    'bhopal', 'visakhapatnam', 'vadodara', 'firozabad', 'ludhiana'
  ];
  const topProducts = ['portable-cabin', 'site-office', 'prefab-house', 'warehouse', 'labour-camp'];

  return topCities.flatMap(citySlug => 
    topProducts.map(productSlug => ({
      citySlug,
      productSlug,
    }))
  );
}

// Revalidate every 24 hours (ISR)
export const revalidate = 86400;

async function getCityProductData(productSlug: string, citySlug: string) {
  try {
    // Fetch city data and products in this category
    const [citiesRes, productsRes, categoriesRes] = await Promise.all([
      api.get<City[]>(`/cities`),
      api.get<any[]>(`/products?category=${productSlug}&status=published&limit=10`),
      api.get<ProductCategory[]>(`/categories`),
    ]);

    const city = citiesRes.data.find(c => c.slug === citySlug);
    const category = categoriesRes.data.find(c => c.slug === productSlug);
    const products = productsRes.data;

    return { city, category, products };
  } catch {
    return { city: null, category: null, products: [] };
  }
}

export async function generateMetadata({ params }: CityProductPageProps): Promise<Metadata> {
  const { city, category } = await getCityProductData(params.productSlug, params.citySlug);
  
  const productName = category?.name || PRODUCT_SLUGS[params.productSlug] || 'Prefab Structure';
  const cityName = city?.name || params.citySlug.charAt(0).toUpperCase() + params.citySlug.slice(1);

  return {
    title: `${productName} in ${cityName} | Buy Prefab Structures | Saman Prefab`,
    description: `Buy ${productName.toLowerCase()} in ${cityName}. High-quality prefabricated structures with fast delivery. Get a free quote today. ISI Certified manufacturer.`,
    alternates: {
      canonical: `/prefab-${params.productSlug}-in-${params.citySlug}`,
    },
    openGraph: {
      title: `${productName} in ${cityName} | Saman Prefab`,
      description: `Buy ${productName.toLowerCase()} in ${cityName}. Fast delivery, ISI certified.`,
      url: `https://samanprefab.com/prefab-${params.productSlug}-in-${params.citySlug}`,
    },
  };
}

export default async function CityProductPage({ params }: CityProductPageProps) {
  const { city, category, products } = await getCityProductData(
    params.productSlug, 
    params.citySlug
  );

  const productName = category?.name || PRODUCT_SLUGS[params.productSlug] || 'Prefab Structure';
  const cityName = city?.name || params.citySlug.charAt(0).toUpperCase() + params.citySlug.slice(1);
  const stateName = city?.state || '';

  // JSON-LD Local Business Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Saman Prefab - ${productName} in ${cityName}`,
    description: `${productName} supplier and manufacturer in ${cityName}${stateName ? `, ${stateName}` : ''}`,
    url: `https://samanprefab.com/prefab-${params.productSlug}-in-${params.citySlug}`,
    telephone: '+91-98765-43210',
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: stateName || 'India',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    serviceType: productName,
  };

  // Product Schema
  const productSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.shortDescription,
        url: `https://samanprefab.com/products/${params.productSlug}/${p.slug}`,
        offers: p.priceMin ? {
          '@type': 'Offer',
          price: p.priceMin,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        } : undefined,
      },
    })),
  } : undefined;

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the delivery time for ${productName} in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We deliver ${productName.toLowerCase()} in ${cityName} within 14-28 days depending on order size and customization requirements.`,
        },
      },
      {
        '@type': 'Question',
        name: `Do you provide installation services in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, we provide complete installation services including transportation, assembly, and commissioning at your site in ${cityName} and surrounding areas.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the warranty on ${productName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `All our prefabricated structures come with a 10-year structural warranty and 1-year warranty on fittings and accessories.`,
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-blue-200 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{cityName}{stateName ? `, ${stateName}` : ''}</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-6">
              {productName} in {cityName}
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl">
              Premium quality {productName.toLowerCase()} available in {cityName} with fast delivery. 
              ISI certified manufacturer with 10-year warranty. Get your free quote today!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/get-quote?product=${params.productSlug}&city=${params.citySlug}`}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Get Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">14-28 Days Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">10-Year Warranty</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">ISI Certified</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Free Installation</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {productName} Supplier in {cityName}
              </h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p className="mb-4">
                  Saman Prefab is a leading manufacturer and supplier of {productName.toLowerCase()} 
                  in {cityName}{stateName ? `, ${stateName}` : ''}. We specialize in delivering 
                  high-quality prefabricated structures that meet ISI standards and are built 
                  to withstand diverse Indian climatic conditions.
                </p>
                <p className="mb-4">
                  Our {productName.toLowerCase()} solutions are ideal for construction sites, 
                  industrial facilities, commercial complexes, schools, hospitals, and residential 
                  projects in {cityName}. With our extensive experience and dedicated team, 
                  we ensure timely delivery and professional installation at your site.
                </p>
                <p>
                  Whether you need a single unit or multiple structures, we can customize 
                  our {productName.toLowerCase()} to meet your specific requirements in terms 
                  of size, layout, insulation, and finishes.
                </p>
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Features of Our {productName}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Weather-resistant construction',
                  'High-quality steel frame',
                  'Insulated walls and roof',
                  'Electrical and plumbing provisions',
                  'Fire-resistant materials',
                  'Pest and termite proof',
                  'Easy to relocate',
                  'Low maintenance',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Applications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Applications in {cityName}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Construction site offices',
                  'Labour accommodation',
                  'Security cabins',
                  'Portable toilets',
                  'Site stores and warehouses',
                  'School classrooms',
                  'Healthcare centers',
                  'Temporary housing',
                ].map((app) => (
                  <div key={app} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-700">{app}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What is the delivery time for {productName} in {cityName}?
                  </h3>
                  <p className="text-gray-600">
                    We deliver {productName.toLowerCase()} in {cityName} within 14-28 days 
                    depending on order size and customization requirements. Standard models 
                    are typically delivered faster.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Do you provide installation services in {cityName}?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we provide complete installation services including transportation, 
                    assembly, and commissioning at your site in {cityName} and surrounding areas.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What is the warranty on {productName}?
                  </h3>
                  <p className="text-gray-600">
                    All our prefabricated structures come with a 10-year structural warranty 
                    and 1-year warranty on fittings and accessories.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I customize the {productName}?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! We offer customization in size, layout, color, insulation 
                    level, window/door placement, and interior finishes.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* CTA Card */}
            <div className="bg-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Get a Free Quote</h3>
              <p className="text-blue-100 mb-4">
                Contact us today for {productName.toLowerCase()} in {cityName}. 
                Best prices guaranteed!
              </p>
              <Link
                href={`/get-quote?product=${params.productSlug}&city=${params.citySlug}`}
                className="block w-full text-center py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Request Quote
              </Link>
              <a
                href="tel:+919876543210"
                className="block w-full text-center py-3 mt-3 border border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="inline h-4 w-4 mr-2" />
                +91 98765 43210
              </a>
            </div>

            {/* Nearby Cities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {productName} in Nearby Cities
              </h3>
              <div className="space-y-2">
                {['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'].map((nearbyCity) => (
                  <Link
                    key={nearbyCity}
                    href={`/prefab-${params.productSlug}-in-${nearbyCity.toLowerCase()}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">{nearbyCity}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Products */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Other Products in {cityName}
              </h3>
              <div className="space-y-2">
                {Object.entries(PRODUCT_SLUGS)
                  .filter(([slug]) => slug !== params.productSlug)
                  .slice(0, 5)
                  .map(([slug, name]) => (
                    <Link
                      key={slug}
                      href={`/prefab-${slug}-in-${params.citySlug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Product Listings */}
      {products.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available {productName} Models in {cityName}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${params.productSlug}/${product.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {product.shortDescription}
                    </p>
                    {product.priceMin && (
                      <p className="text-blue-600 font-semibold">
                        ₹{product.priceMin.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
