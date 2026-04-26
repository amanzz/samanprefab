import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postService } from "@/services/post.service";
import { productService } from "@/services/product.service";
import { PostStatus, type Post } from "@/types/post.types";
import { ProductStatus } from "@/types/product.types";
import { API_CONFIG } from "@/lib/api";
import { FAQAccordion } from "./FAQAccordion";
import { StickyShare } from "./StickyShare";
import { Sidebar } from "./Sidebar";
import { CTASection } from "./CTASection";
import { RelatedProducts } from "./RelatedProducts";
import { RelatedPosts } from "./RelatedPosts";
import { ArticleContent } from "./ArticleContent";
import { ReadingProgress } from "./ReadingProgress";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = "https://samanprefab.com";

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateReadTime(content?: string): number {
  if (!content) return 3;
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(3, Math.ceil(words / wordsPerMinute));
}

function toAbsoluteUrl(urlOrPath: string): string {
  if (!urlOrPath) return SITE_URL;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  return `${SITE_URL}${urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractInlineMedia(content: Record<string, any> | undefined): { src: string; alt: string; caption?: string }[] {
  if (!content) return [];

  const imageCollections = [content.images, content.media, content.gallery].filter(Array.isArray);
  const all = imageCollections.flat() as any[];

  const normalized: { src: string; alt: string; caption?: string }[] = [];

  all.forEach((item) => {
    if (typeof item === "string") {
      const src = API_CONFIG.assetUrl(item);
      if (src) {
        normalized.push({
          src,
          alt: "Blog inline image",
        });
      }
      return;
    }

    const src = API_CONFIG.assetUrl(item?.url || item?.src || item?.image);
    if (!src) return;

    normalized.push({
      src,
      alt: item?.alt || item?.title || "Blog inline image",
      caption: item?.caption || item?.description || undefined,
    });
  });

  return normalized;
}

async function getRelatedPosts(currentSlug: string, categoryId?: string): Promise<Post[]> {
  try {
    const result = await postService.getAll({
      status: PostStatus.PUBLISHED,
      limit: 4,
      excludeSlug: currentSlug,
      ...(categoryId && { categoryId }),
    });
    return result.items.slice(0, 3);
  } catch {
    return [];
  }
}

async function getRecentPosts(currentSlug: string): Promise<Post[]> {
  try {
    const result = await postService.getAll({
      status: PostStatus.PUBLISHED,
      limit: 4,
      sort: "publishedAt:desc",
    });
    return result.items.filter((p) => p.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<any[]> {
  try {
    const result = await productService.getAll({
      status: ProductStatus.ACTIVE,
      featured: true,
      limit: 3,
    });
    return result.items.slice(0, 3);
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await postService.getBySlug(slug);
    // Only return published posts for public pages
    if (post.status !== PostStatus.PUBLISHED) {
      return null;
    }
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const canonicalPath = post.canonicalUrl || `/blog/${post.slug}`;
  const canonical = toAbsoluteUrl(canonicalPath);
  const ogImage = post.ogImage || post.featuredImage || "";

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} | Blog`,
    description,
    keywords: post.tags?.map((t) => t.name) || [],
    category: post.categories?.[0]?.name,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      type: "article",
      url: canonical,
      siteName: "Saman Prefab",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.authorId ? [`/author/${post.authorId}`] : undefined,
      tags: post.tags?.map((t) => t.name),
      images: ogImage ? [{ url: toAbsoluteUrl(ogImage), alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitterTitle || post.ogTitle || title,
      description: post.twitterDescription || post.ogDescription || description,
      images: post.twitterImage || ogImage ? [toAbsoluteUrl(post.twitterImage || ogImage)] : undefined,
    },
  };
}

function ArticleSchema({ post, readTime, wordCount }: { post: Post; readTime: number; wordCount: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.featuredImage ? [toAbsoluteUrl(post.featuredImage)] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "en-IN",
    articleSection: post.categories?.[0]?.name,
    keywords: post.tags?.map((tag) => tag.name).join(", "),
    wordCount,
    timeRequired: `PT${readTime}M`,
    author: post.authorId
      ? {
        "@type": "Person",
        name: "Saman Prefab Team",
        url: "https://samanprefab.com",
      }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Saman Prefab",
      logo: {
        "@type": "ImageObject",
        url: "https://samanprefab.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://samanprefab.com/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function BreadcrumbSchema({ slug, title }: { slug: string; title: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function extractFAQsFromContent(content: Record<string, any> | undefined): { question: string; answer: string }[] {
  if (!content) return [];

  // Check for explicit FAQs array
  if (content.faqs && Array.isArray(content.faqs)) {
    return content.faqs;
  }

  // Check for blogFaqs (from AI generation)
  if (content.blogFaqs && Array.isArray(content.blogFaqs)) {
    return content.blogFaqs.map((f: any) => ({
      question: f.question,
      answer: f.answer,
    }));
  }

  return [];
}

function injectHeadingIds(html: string): string {
  if (!html) return "";
  const idCounter: Record<string, number> = {};
  return html.replace(/<(h[2-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, content) => {
    if (/\bid\s*=/.test(attrs)) return _match;
    const text = content.replace(/<[^>]*>/g, "").trim();
    let baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    if (!baseId) baseId = "heading";
    idCounter[baseId] = (idCounter[baseId] || 0) + 1;
    const id = idCounter[baseId] > 1 ? `${baseId}-${idCounter[baseId]}` : baseId;
    return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
  });
}

function splitContentAtPercentage(html: string, percent = 0.35): [string, string] {
  if (!html || html.length < 600) return [html, ""];
  const blockEndPattern = /<\/(p|h[2-6]|ul|ol|blockquote|figure)>/gi;
  const positions: number[] = [];
  let m;
  while ((m = blockEndPattern.exec(html)) !== null) {
    positions.push(m.index + m[0].length);
  }
  if (positions.length < 5) return [html, ""];
  const splitIdx = Math.max(2, Math.floor(positions.length * percent));
  const splitPos = positions[splitIdx - 1];
  return [html.slice(0, splitPos).trim(), html.slice(splitPos).trim()];
}

function extractTopicHeadings(html: string): string[] {
  const matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches
    .map(([, content]) => content.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const category = post.categories?.[0];
  const publishDate = post.publishedAt || post.createdAt;
  const rawContentHtml = (post.content as any)?.html || "";
  const contentText = (post.content as any)?.text || stripHtml(rawContentHtml) || "";
  const faqs = extractFAQsFromContent(post.content);
  const inlineMedia = extractInlineMedia(post.content);
  const readTime = calculateReadTime(contentText);
  const wordCount = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
  const processedHtml = injectHeadingIds(rawContentHtml);
  const [firstHalf, secondHalf] = splitContentAtPercentage(processedHtml);
  const topicHeadings = extractTopicHeadings(processedHtml);

  // Fetch related data
  const [relatedPosts, recentPosts, featuredProducts] = await Promise.all([
    getRelatedPosts(slug, category?.id),
    getRecentPosts(slug),
    getFeaturedProducts(),
  ]);

  const shareUrl = `https://samanprefab.com/blog/${post.slug}`;

  return (
    <main className="bg-white dark:bg-gray-900">
      <ReadingProgress />

      {/* JSON-LD Schemas */}
      <ArticleSchema post={post} readTime={readTime} wordCount={wordCount} />
      <BreadcrumbSchema slug={post.slug} title={post.title} />
      <FAQSchema faqs={faqs} />

      {/* Sticky Share Bar */}
      <StickyShare post={post} shareUrl={shareUrl} />

      {/* Hero Section - Premium Redesign */}
      <section className="pt-12 md:pt-16 pb-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs — pill style */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="inline-flex items-center bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                >
                  Blog
                </Link>
              </li>
              {category && (
                <>
                  <li aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                  <li>
                    <Link
                      href={`/blog?category=${category.slug}`}
                      className="inline-flex items-center bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li aria-current="page">
                <span className="inline-flex items-center bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-200 dark:border-brand-800 max-w-[200px] sm:max-w-xs truncate">
                  {post.title}
                </span>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Content Column */}
            <div className="lg:col-span-8 min-w-0 mb-20 self-start">
              {/* Category Badge */}
              {category && (
                <div className="mb-4">
                  <Link
                    href={`/blog?category=${category.slug}`}
                    className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-brand-100 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {category.name}
                  </Link>
                </div>
              )}

              {/* Title - H1 for SEO */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
                {post.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <time dateTime={publishDate} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(publishDate)}
                </time>
                <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readTime} min read
                </span>
                <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Saman Prefab Team
                </span>
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {post.tags.length} tags
                    </span>
                  </>
                )}
              </div>

              {/* Author Bio Card */}
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                  SP
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Saman Prefab Team</h3>
                    <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Expert prefab manufacturers providing high-quality portable cabins and modular structures for industrial, commercial, and residential applications across India.
                  </p>
                </div>
              </div>

              {post.excerpt && (
                <div className="mb-12">
                  <div className="w-12 h-1 bg-gradient-to-r from-brand-500 to-brand-300 rounded-full mb-6" />
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* What You'll Learn — section preview from H2 headings */}
              {topicHeadings.length >= 2 && (
                <div className="mb-8 p-5 bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900 rounded-2xl border border-brand-100 dark:border-brand-800/60 max-w-3xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                      What You&apos;ll Learn
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {topicHeadings.map((heading, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        <span className="leading-relaxed">{heading}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Featured Image - Prominent Display */}
              {post.featuredImage && (
                <figure className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl mb-8 lg:mb-12 ring-1 ring-black/5 dark:ring-white/10">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <figcaption className="absolute left-4 bottom-4 text-xs sm:text-sm text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    Featured image for {post.title}
                  </figcaption>
                </figure>
              )}

              {/* Article Content — split with mid-article CTA */}
              <div className="relative">
                <div className="w-20 h-1 bg-gradient-to-r from-brand-500 to-brand-300 rounded-full mb-8" />

                {/* First ~35% of content */}
                <ArticleContent html={firstHalf || processedHtml} />

                {/* Mid-article conversion block — only shown when content splits */}
                {secondHalf && (
                  <>
                    {/* Inline CTA */}
                    <div className="my-10 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-brand-900/30 dark:via-gray-900 dark:to-brand-800/10 p-7 sm:p-9 shadow-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="flex-1">
                          <span className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Free Expert Advice
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Get Your Custom Prefab Solution
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Our experts will design a solution tailored to your requirements. Free consultation — no commitment.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                          <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-7 rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl text-sm"
                          >
                            Get Free Quote
                          </Link>
                          <a
                            href="https://wa.me/919999999999?text=Hi%20Saman%20Prefab,%20I%20need%20a%20prefab%20solution"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-7 rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Chat Now
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits Highlight Box */}
                    <div className="my-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm uppercase tracking-wider">Key Benefits of Prefab Construction</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                          { emoji: "⚡", title: "Fast Delivery", text: "Ready in days, not months — minimal site disruption" },
                          { emoji: "💰", title: "Cost Effective", text: "Up to 30% savings vs traditional construction methods" },
                          { emoji: "♻️", title: "Eco-Friendly", text: "Less waste, lower carbon footprint, reusable structures" },
                        ].map((item) => (
                          <div key={item.title} className="flex items-start gap-3">
                            <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
                            <div>
                              <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">{item.title}</p>
                              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">{item.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remaining ~65% of content */}
                    <ArticleContent html={secondHalf} isFragment />
                  </>
                )}

                <div className="flex justify-end mt-8">
                  <div className="w-20 h-1 bg-gradient-to-r from-brand-300 to-brand-500 rounded-full" />
                </div>
              </div>

              {inlineMedia.length > 0 && (
                <section className="max-w-3xl mt-10 space-y-6" aria-label="Inline media">
                  {inlineMedia.map((media, index) => (
                    <figure
                      key={`${media.src}-${index}`}
                      className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                    >
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={media.src}
                          alt={media.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 820px"
                        />
                      </div>
                      {media.caption && (
                        <figcaption className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {media.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </section>
              )}

              {/* Inline Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="max-w-3xl mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Tagged
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/blog?tag=${tag.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        <span className="text-brand-500">#</span>
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog Link */}
              <div className="max-w-3xl mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Articles
                </Link>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24">
                <Sidebar
                  relatedPosts={relatedPosts}
                  recentPosts={recentPosts}
                  category={category}
                  contentHtml={processedHtml}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ Section - Enhanced Accordion */}
      {faqs.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-800/30 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Common questions about this topic
                </p>
              </div>
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Conversion Focused */}
      <CTASection />

      {/* Related Products - Internal Linking */}
      {featuredProducts.length > 0 && (
        <RelatedProducts products={featuredProducts} />
      )}

      {/* Related Posts - Internal Linking */}
      {relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}

      {/* Mobile Sidebar Content - Shows at bottom on mobile */}
      <section className="lg:hidden py-8 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <Sidebar
            relatedPosts={relatedPosts}
            recentPosts={recentPosts}
            category={category}
            contentHtml={processedHtml}
          />
        </div>
      </section>
    </main>
  );
}
