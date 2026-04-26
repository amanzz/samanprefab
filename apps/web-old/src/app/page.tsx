import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Saman Prefab | Quality Prefabricated Structures',
  description:
    'High-quality prefabricated structures for residential, commercial, and industrial use. Get instant quotes for prefab buildings across India.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24 px-4">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Premium Prefabricated
            <br />
            <span className="text-blue-300">Structures for India</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            From portable cabins to large modular buildings — quality construction, fast
            delivery, competitive pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-quote"
              className="bg-white text-blue-900 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg min-h-[52px] flex items-center justify-center"
            >
              Get Free Quote
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg min-h-[52px] flex items-center justify-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose Saman Prefab?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fast Delivery',
                description: 'Structures ready in 2-4 weeks with on-site installation support.',
              },
              {
                title: 'Pan-India Service',
                description: 'Serving 500+ cities across all states. Local support guaranteed.',
              },
              {
                title: 'Quality Assured',
                description: 'ISI-certified materials, engineered to withstand Indian weather.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Tell us your requirements and get a customised quote within 24 hours.
          </p>
          <Link
            href="/get-quote"
            className="bg-white text-blue-900 font-semibold px-10 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg inline-flex items-center min-h-[52px]"
          >
            Request a Free Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
