import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/post.types";

interface PostCardProps {
  post: Post;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post }: PostCardProps) {
  const category = post.categories?.[0];
  const publishDate = post.publishedAt || post.createdAt;

  return (
    <article className="group flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 mb-5 shadow-lg transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30">
              <span className="text-brand-400 font-bold text-lg">Saman Prefab</span>
            </div>
          )}
          
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
        <div className="flex flex-col flex-1 px-1">
          {/* Date */}
          <time className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            {formatDate(publishDate)}
          </time>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Read More Link */}
          <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
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
}
