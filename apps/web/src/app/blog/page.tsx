import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/blog/PostCard";
import { postService } from "@/services/post.service";
import { PostStatus, type Post } from "@/types/post.types";

export const metadata: Metadata = {
  title: "Blog | Insights & Updates",
  description: "Explore the latest insights, trends, and updates on prefabricated structures, portable cabins, and modular construction from Saman Prefab.",
  keywords: ["prefab blog", "portable cabins", "modular construction", "prefabricated structures", "Saman Prefab"],
  openGraph: {
    title: "Blog | Saman Prefab Insights & Updates",
    description: "Latest insights on prefabricated structures and modular construction.",
    type: "website",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: Post[] = [];
  let error: Error | null = null;

  try {
    const result = await postService.getAll({
      status: PostStatus.PUBLISHED,
      limit: 50,
    });
    posts = result.items || [];
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative pt-16 md:pt-24 pb-20 lg:pb-28 bg-gray-900">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/assets/images/hero.png"
            alt="Blog Header"
            fill
            className="object-cover brightness-[0.6]"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">Blog</span>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Insights &{" "}
              <span className="text-brand-500">Updates</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl leading-relaxed">
              Discover expert insights on prefabricated structures, industry trends,
              and the future of modular construction.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        {error !== null ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-error-50 dark:bg-error-900/30 flex items-center justify-center text-error-600 dark:text-error-400">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Unable to Load Articles
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              We&apos;re having trouble fetching blog posts. Please try again later.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-brand-700 transition-all"
            >
              Try Again
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No Articles Yet
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Check back soon for new insights and updates.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              Return to Home
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Latest Articles
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {posts.length} {posts.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {/* Grid - 3/2/1 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Internal Linking Section */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-gray-400 dark:text-gray-500">Explore:</span>
            <Link
              href="/products"
              className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              Our Products
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              About Us
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/contact"
              className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
