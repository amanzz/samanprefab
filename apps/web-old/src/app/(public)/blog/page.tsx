import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Prefab Construction Tips & Industry Insights | Saman Prefab',
  description: 'Expert articles on prefabricated construction, portable cabins, site offices, and industry trends. Stay informed with Saman Prefab blog.',
  alternates: {
    canonical: '/blog',
  },
};

// Sample blog posts (will be replaced with API data)
const BLOG_POSTS = [
  {
    id: '1',
    slug: 'benefits-of-portable-cabins-construction-sites',
    title: 'Top 10 Benefits of Portable Cabins for Construction Sites',
    excerpt: 'Discover why construction companies across India are choosing portable cabins for site offices, labour camps, and storage solutions.',
    coverImage: '/images/blog/portable-cabins.jpg',
    publishedAt: '2026-04-15',
    author: { name: 'Saman Prefab Team' },
    category: 'Construction',
    readTime: '5 min read',
  },
  {
    id: '2',
    slug: 'prefab-vs-traditional-construction-cost-comparison',
    title: 'Prefab vs Traditional Construction: Complete Cost Comparison 2026',
    excerpt: 'A detailed analysis comparing the costs, timeline, and benefits of prefabricated construction versus traditional building methods.',
    coverImage: '/images/blog/cost-comparison.jpg',
    publishedAt: '2026-04-10',
    author: { name: 'Rajesh Sharma' },
    category: 'Industry Insights',
    readTime: '8 min read',
  },
  {
    id: '3',
    slug: 'choosing-right-prefab-structure-your-business',
    title: 'How to Choose the Right Prefab Structure for Your Business',
    excerpt: 'From site offices to warehouses, learn how to select the perfect prefabricated solution based on your specific requirements.',
    coverImage: '/images/blog/choosing-prefab.jpg',
    publishedAt: '2026-04-05',
    author: { name: 'Priya Patel' },
    category: 'Buying Guide',
    readTime: '6 min read',
  },
  {
    id: '4',
    slug: 'isi-certification-prefab-structures-why-matters',
    title: 'ISI Certification for Prefab Structures: Why It Matters',
    excerpt: 'Understanding ISI certification standards and why you should always choose certified prefabricated structure manufacturers.',
    coverImage: '/images/blog/isi-certification.jpg',
    publishedAt: '2026-03-28',
    author: { name: 'Saman Prefab Team' },
    category: 'Quality Standards',
    readTime: '4 min read',
  },
  {
    id: '5',
    slug: 'maintaining-prefab-structures-seasonal-guide',
    title: 'Seasonal Maintenance Guide for Prefab Structures',
    excerpt: 'Essential maintenance tips to ensure your portable cabins and prefab structures last longer and perform better throughout the year.',
    coverImage: '/images/blog/maintenance.jpg',
    publishedAt: '2026-03-20',
    author: { name: 'Amit Kumar' },
    category: 'Maintenance',
    readTime: '7 min read',
  },
  {
    id: '6',
    slug: 'future-prefab-construction-india-2026',
    title: 'The Future of Prefab Construction in India: 2026 Outlook',
    excerpt: 'Explore the growing prefabricated construction industry in India and emerging trends shaping the future of building.',
    coverImage: '/images/blog/future-prefab.jpg',
    publishedAt: '2026-03-15',
    author: { name: 'Saman Prefab Team' },
    category: 'Industry Trends',
    readTime: '10 min read',
  },
];

const CATEGORIES = ['All', 'Construction', 'Industry Insights', 'Buying Guide', 'Quality Standards', 'Maintenance'];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Saman Prefab Blog</h1>
            <p className="text-blue-100 text-lg">
              Expert insights, industry trends, and practical guides on prefabricated construction.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="aspect-[16/9] bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Load More Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-blue-100 mb-6">
            Get the latest industry insights and construction tips delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
