"use client";

import { useEffect, useRef, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

export function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Parse IDs directly from the pre-processed HTML (IDs already injected server-side)
    const headingPattern = /<h([2-3])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
    const extracted: Heading[] = [];
    let match;
    const seen = new Set<string>();
    while ((match = headingPattern.exec(contentHtml)) !== null) {
      const [, level, id, content] = match;
      const text = content.replace(/<[^>]*>/g, "").trim();
      const lower = text.toLowerCase();
      if (text && !lower.startsWith("q:") && !lower.startsWith("question:") && !seen.has(id)) {
        seen.add(id);
        extracted.push({ id, text, level: parseInt(level) });
      }
    }
    setHeadings(extracted);
  }, [contentHtml]);

  useEffect(() => {
    if (!headings.length) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  const completedCount = headings.findIndex((h) => h.id === activeId);
  const progressPct = headings.length > 1
    ? Math.round(((completedCount < 0 ? 0 : completedCount) / (headings.length - 1)) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Contents</h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{headings.length} sections</span>
        </div>
        {/* Reading progress within article */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {headings.map((heading, idx) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={`group flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg transition-all duration-200 ${
              activeId === heading.id
                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200"
            } ${heading.level === 3 ? "pl-7" : ""}`}
          >
            {/* Index indicator */}
            <span
              className={`shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                activeId === heading.id
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400"
              }`}
            >
              {heading.level === 3 ? "›" : idx + 1}
            </span>
            <span className="leading-tight line-clamp-2">{heading.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
