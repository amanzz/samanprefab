import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';

interface BlogPageProps {
  params: {
    slug: string;
  };
}

// Sample blog data (replace with API fetch)
const BLOG_POSTS: Record<string, {
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  author: { name: string; role?: string };
  readTime: string;
  category: string;
  tags: string[];
}> = {
  'benefits-of-portable-cabins-construction-sites': {
    title: 'Top 10 Benefits of Portable Cabins for Construction Sites',
    excerpt: 'Discover why construction companies across India are choosing portable cabins for site offices, labour camps, and storage solutions.',
    content: `
      <h2>Why Portable Cabins Are Essential for Modern Construction</h2>
      <p>Construction sites in India are increasingly turning to portable cabins as a flexible, cost-effective solution for on-site infrastructure. These prefabricated structures offer numerous advantages over traditional construction methods.</p>
      
      <h2>1. Rapid Deployment</h2>
      <p>Portable cabins can be delivered and installed within days, not months. This rapid deployment ensures your project timeline stays on track from day one.</p>
      
      <h2>2. Cost Efficiency</h2>
      <p>Compared to building permanent structures, portable cabins offer significant cost savings—typically 30-50% less than conventional construction for temporary needs.</p>
      
      <h2>3. Flexibility and Mobility</h2>
      <p>As your project progresses, portable cabins can be easily relocated to different areas of the site or to new project locations entirely.</p>
      
      <h2>4. Customizable Designs</h2>
      <p>Modern portable cabins can be customized with electrical wiring, plumbing, air conditioning, and interior finishes to meet specific requirements.</p>
      
      <h2>5. Weather Resistance</h2>
      <p>Built with high-quality steel frames and weather-resistant materials, these structures withstand India's diverse climate conditions.</p>
      
      <h2>6. Enhanced Security</h2>
      <p>Steel construction provides better security for equipment storage and site offices compared to temporary tents or fabric structures.</p>
      
      <h2>7. Eco-Friendly Option</h2>
      <p>Portable cabins produce less construction waste and can be reused across multiple projects, reducing environmental impact.</p>
      
      <h2>8. Compliance Ready</h2>
      <p>ISI-certified portable cabins meet all relevant building codes and safety standards required for construction sites.</p>
      
      <h2>9. Scalable Solutions</h2>
      <p>Start with what you need and add more units as your team grows—perfect for projects with expanding workforce requirements.</p>
      
      <h2>10. Minimal Site Disruption</h2>
      <p>Installation requires minimal foundation work, preserving your site for the main construction activities.</p>
      
      <h2>Conclusion</h2>
      <p>Whether you need a site office, labour camp, storage unit, or security cabin, portable cabins offer an unbeatable combination of speed, cost-efficiency, and flexibility. Contact Saman Prefab today to discuss your requirements.</p>
    `,
    publishedAt: '2026-04-15',
    author: { name: 'Saman Prefab Team', role: 'Content Team' },
    readTime: '5 min read',
    category: 'Construction',
    tags: ['portable cabins', 'construction', 'site offices', 'labour camps'],
  },
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const post = BLOG_POSTS[params.slug];
  
  if (!post) {
    return { title: 'Blog Post Not Found | Saman Prefab' };
  }

  return {
    title: `${post.title} | Saman Prefab Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = BLOG_POSTS[params.slug];

  if (!post) {
    notFound();
  }

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Saman Prefab',
      logo: {
        '@type': 'ImageObject',
        url: 'https://samanprefab.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://samanprefab.com/blog/${params.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-200 hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/30 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <span className="text-blue-200 text-sm">{post.readTime}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
                {post.author.role && (
                  <span className="text-blue-300">• {post.author.role}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="prose prose-lg prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Share this article:</span>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CTA */}
        <section className="bg-blue-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact our team for a free consultation and quote for your prefab structure needs.
            </p>
            <Link
              href="/get-quote"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Free Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Related Posts */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(BLOG_POSTS)
              .filter(([slug]) => slug !== params.slug)
              .slice(0, 2)
              .map(([slug, relatedPost]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {relatedPost.category}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {relatedPost.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{relatedPost.readTime}</span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </article>
    </>
  );
}
