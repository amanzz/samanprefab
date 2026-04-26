import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/post.types";

interface RelatedPostsProps {
  posts: Post[];
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Continue Reading
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            More articles you might find interesting
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post) => {
            const category = post.categories?.[0];
            return (
              <article
                key={post.id}
                className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Featured Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30">
                        <span className="text-brand-400 font-bold text-lg">Saman Prefab</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    {category && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-block bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                          {category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Date */}
                    <time className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </time>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors mt-auto">
                      <span>Read Article</span>
                      <svg 
                        className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition-all"
          >
            Browse All Articles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
