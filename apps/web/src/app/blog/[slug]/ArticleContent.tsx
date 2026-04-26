"use client";

import DOMPurify from "dompurify";

interface ArticleContentProps {
  html: string;
  isFragment?: boolean;
}

function normalizeHeadingHierarchy(html: string): string {
  if (!html) return "";
  return html
    .replace(/<h1(\s|>)/gi, "<h2$1")
    .replace(/<\/h1>/gi, "</h2>");
}

export function ArticleContent({ html, isFragment = false }: ArticleContentProps) {
  const normalizedHtml = normalizeHeadingHierarchy(html);
  const purify = (DOMPurify as typeof DOMPurify & { default?: typeof DOMPurify }).default || DOMPurify;
  const contentHtml = purify.sanitize(normalizedHtml, {
    ALLOWED_TAGS: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "br",
      "hr",
      "img",
      "figure",
      "figcaption",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "id", "class", "width", "height"],
  });

  if (!contentHtml) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <svg
          className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">
          No content available for this article.
        </p>
      </div>
    );
  }

  const Tag = isFragment ? "div" : "article";

  return (
    <Tag
      className="prose prose-lg sm:prose-xl max-w-none lg:max-w-3xl mx-auto
        dark:prose-invert
        prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-headings:tracking-tight prose-headings:scroll-mt-28
        prose-h1:text-4xl prose-h1:mt-0 prose-h1:mb-8
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pt-2 prose-h2:border-t prose-h2:border-gray-200 dark:prose-h2:border-gray-700
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-bold
        prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3 prose-h4:font-semibold
        prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:text-lg prose-p:mb-6
        prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
        prose-em:text-gray-700 dark:prose-em:text-gray-200
        prose-ul:my-6 prose-ol:my-6 prose-li:my-3 prose-li:leading-7 prose-li:text-base
        prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-brand-500 prose-li:marker:font-bold prose-li:pl-2
        prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:pl-6
        prose-blockquote:not-italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
        prose-blockquote:bg-gradient-to-r prose-blockquote:from-brand-50 prose-blockquote:to-transparent
        prose-blockquote:dark:from-brand-900/20 prose-blockquote:dark:to-transparent
        prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl prose-blockquote:my-8
        prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-10 prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700
        prose-figure:my-10 prose-figcaption:text-sm prose-figcaption:text-gray-500 prose-figcaption:mt-3 prose-figcaption:text-center prose-figcaption:italic
        prose-hr:border-gray-200 prose-hr:dark:border-gray-700 prose-hr:my-12 prose-hr:border-t-2
        prose-code:text-brand-600 prose-code:dark:text-brand-400 prose-code:font-semibold prose-code:bg-brand-50 prose-code:dark:bg-brand-900/20 prose-code:px-2 prose-code:py-1 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-xl
        [&>*:first-child]:mt-0"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
