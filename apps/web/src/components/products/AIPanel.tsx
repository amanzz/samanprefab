"use client";

import React, { useState, useCallback, useEffect, useLayoutEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIPanelContext = "product" | "blog";
type AITab = "generate" | "rewrite";
type GenerateMode = "full" | "description" | "faq" | "seo";
type RewriteMode = "rewrite" | "expand" | "seo_optimize";

export interface AIApplyPayload {
  // Product fields
  name?: string;
  shortDescription?: string;
  description?: string;
  attributes?: { id: string; label: string; value: string }[];
  faqs?: { id: string; question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Blog fields
  title?: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  suggestedSlug?: string;
  internalLinkSuggestions?: string[];
  blogFaqs?: { id: string; question: string; answer: string }[];
}

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: AIPanelContext;
  // Product context
  productName?: string;
  shortDescription?: string;
  category?: string;
  // Blog context
  postTitle?: string;
  postCategory?: string;
  postTags?: string;
  postExcerpt?: string;
  // Rewrite input
  selectedText?: string;
  onApply: (data: AIApplyPayload) => void;
}

// ─── AI call helper ───────────────────────────────────────────────────────────

async function callAI(
  type: string,
  ctx: Record<string, any>,
  contentContext: AIPanelContext
): Promise<{ data: Record<string, any>; _meta?: { settingsLoaded: boolean; durationMs: number } }> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, context: ctx, contentContext }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "AI generation failed");
  return json;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle className="opacity-25" cx="12" cy="12" r="10" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); };
  return (
    <button type="button" onClick={copy}
      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-semibold text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800">
      {done
        ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
        : <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
      }
    </button>
  );
}

interface SectionCardProps {
  label: string;
  accent: string;
  badge?: string;
  onApply?: () => void;
  copyText?: string;
  children: React.ReactNode;
  collapsible?: boolean;
}
function SectionCard({ label, accent, badge, onApply, copyText, children, collapsible }: SectionCardProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`overflow-hidden rounded-xl border ${accent} transition-all`}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          {collapsible && (
            <button type="button" onClick={() => setOpen(v => !v)} className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition-transform duration-150 ${open ? "" : "-rotate-90"}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
          {badge && <span className="rounded-full bg-gray-100 px-1.5 py-px text-[9px] font-semibold text-gray-400 dark:bg-gray-800">{badge}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {copyText && <CopyBtn text={copyText} />}
          {onApply && (
            <button type="button" onClick={onApply}
              className="rounded-md bg-brand-500 px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-brand-600">
              Apply
            </button>
          )}
        </div>
      </div>
      {open && <div className="border-t border-inherit px-3 py-3">{children}</div>}
    </div>
  );
}

// ─── Generate modes ────────────────────────────────────────────────────────────

const GENERATE_MODES: { id: GenerateMode; label: string; icon: string; desc: string }[] = [
  { id: "full",        label: "Full Content", icon: "✨", desc: "Title + body + FAQs + SEO" },
  { id: "description", label: "Description",  icon: "📝", desc: "Body / description only"   },
  { id: "faq",         label: "FAQs Only",    icon: "💬", desc: "6 SEO-optimized FAQs"      },
  { id: "seo",         label: "SEO Meta",     icon: "🔍", desc: "Meta title, desc, keywords" },
];

const LOADING_MSGS = ["Analyzing content…", "Building prompt…", "Generating with AI…", "Formatting output…"];

// ─── Result sections sub-component ───────────────────────────────────────────

function GenerateResultPanel({
  result,
  isBlog,
  onApply,
  onClear,
}: {
  result: Record<string, any>;
  isBlog: boolean;
  onApply: (p: AIApplyPayload) => void;
  onClear: () => void;
}) {
  const seoTitle = result.seoTitle ?? result.metaTitle ?? "";
  const seoDesc  = result.seoDescription ?? result.metaDescription ?? "";
  const seoKw    = result.seoKeywords ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Generated Output</p>
        <button type="button" onClick={onClear}
          className="text-[10px] font-semibold text-gray-400 transition-colors hover:text-error-500">
          Clear ✕
        </button>
      </div>

      {/* Title */}
      {result.title && (
        <SectionCard label="Title" accent="border-blue-200 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5"
          copyText={result.title}
          onApply={() => onApply(isBlog ? { title: result.title } : { name: result.title })}>
          <p className="text-sm font-semibold leading-snug text-gray-800 dark:text-white">{result.title}</p>
        </SectionCard>
      )}

      {/* Excerpt / Short Desc */}
      {(result.excerpt || result.shortDescription) && (
        <SectionCard label={isBlog ? "Excerpt" : "Short Description"}
          accent="border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-indigo-500/5"
          copyText={result.excerpt ?? result.shortDescription}
          onApply={() => onApply(isBlog ? { excerpt: result.excerpt } : { shortDescription: result.shortDescription })}>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            {result.excerpt ?? result.shortDescription}
          </p>
        </SectionCard>
      )}

      {/* Description / Content */}
      {(result.description || result.content) && (
        <SectionCard label={isBlog ? "Post Content" : "Description"}
          accent="border-violet-200 bg-violet-50/50 dark:border-violet-500/30 dark:bg-violet-500/5"
          collapsible
          copyText={result.description ?? result.content}
          onApply={() => onApply(isBlog ? { content: result.content } : { description: result.description })}>
          {isBlog && result.headings?.length > 0 && (
            <div className="mb-3 space-y-1 border-b border-violet-100 pb-3 dark:border-violet-500/20">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Content Structure ({result.headings.length} sections)
              </p>
              {result.headings.map((h: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                  <span className="mt-px rounded bg-violet-100 px-1 text-[8px] font-bold text-violet-500 dark:bg-violet-500/20">H2</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            {((result.description ?? result.content ?? "") as string)
              .replace(/<[^>]+>/g, "")
              .substring(0, 260)}
            {((result.description ?? result.content ?? "") as string).replace(/<[^>]+>/g, "").length > 260 && "…"}
          </p>
        </SectionCard>
      )}

      {/* Specs (product) */}
      {result.specs?.length > 0 && (
        <SectionCard label={`Specs`} badge={`${result.specs.length} items`}
          accent="border-cyan-200 bg-cyan-50/50 dark:border-cyan-500/30 dark:bg-cyan-500/5"
          collapsible
          copyText={result.specs.map((s: any) => `${s.label}: ${s.value}`).join("\n")}
          onApply={() => onApply({ attributes: result.specs.map((s: any, i: number) => ({ id: `ai-${i}`, label: s.label ?? "", value: s.value ?? "" })) })}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {result.specs.slice(0, 8).map((s: any, i: number) => (
              <div key={i} className="text-[11px]">
                <span className="font-semibold text-gray-500">{s.label}: </span>
                <span className="text-gray-400">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Internal links (blog) */}
      {result.internalLinkSuggestions?.length > 0 && (
        <SectionCard label="Internal Links"
          accent="border-teal-200 bg-teal-50/50 dark:border-teal-500/30 dark:bg-teal-500/5"
          copyText={result.internalLinkSuggestions.join(", ")}
          onApply={() => onApply({ internalLinkSuggestions: result.internalLinkSuggestions })}>
          <div className="flex flex-wrap gap-1.5">
            {result.internalLinkSuggestions.map((l: string, i: number) => (
              <span key={i} className="rounded-md bg-teal-100 px-2 py-0.5 font-mono text-[10px] text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">{l}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* FAQs */}
      {result.faqs?.length > 0 && (
        <SectionCard label="FAQs" badge={`${result.faqs.length}`}
          accent="border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5"
          collapsible
          copyText={result.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
          onApply={() => onApply(isBlog
            ? { blogFaqs: result.faqs.map((f: any, i: number) => ({ id: `ai-faq-${i}`, question: f.question, answer: f.answer })) }
            : { faqs: result.faqs.map((f: any, i: number) => ({ id: `ai-faq-${i}`, question: f.question ?? "", answer: f.answer ?? "" })) })}>
          <div className="space-y-2.5">
            {result.faqs.map((f: any, i: number) => (
              <div key={i} className="rounded-lg border border-amber-100 bg-white p-2.5 dark:border-amber-500/20 dark:bg-gray-900">
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Q: {f.question}</p>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-gray-500">A: {f.answer}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* SEO Meta */}
      {(seoTitle || seoDesc || seoKw) && (
        <SectionCard label="SEO Meta"
          accent="border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5"
          copyText={[seoTitle && `Title: ${seoTitle}`, seoDesc && `Desc: ${seoDesc}`, seoKw && `Keywords: ${seoKw}`].filter(Boolean).join("\n")}
          onApply={() => onApply(isBlog
            ? { metaTitle: seoTitle, metaDescription: seoDesc, seoTitle, seoDescription: seoDesc }
            : { seoTitle, seoDescription: seoDesc, seoKeywords: seoKw })}>
          <div className="space-y-2.5">
            {seoTitle && (
              <div>
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Meta Title</span>
                  <span className={`text-[10px] font-bold ${seoTitle.length >= 50 && seoTitle.length <= 60 ? "text-emerald-500" : "text-amber-500"}`}>
                    {seoTitle.length}/60
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-white">{seoTitle}</p>
              </div>
            )}
            {seoDesc && (
              <div>
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Meta Description</span>
                  <span className={`text-[10px] font-bold ${seoDesc.length >= 150 && seoDesc.length <= 160 ? "text-emerald-500" : "text-amber-500"}`}>
                    {seoDesc.length}/160
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">{seoDesc}</p>
              </div>
            )}
            {seoKw && (
              <div className="flex flex-wrap gap-1">
                {seoKw.split(",").map((k: string, i: number) => (
                  <span key={i} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {k.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIPanel({
  isOpen,
  onClose,
  context = "product",
  productName,
  shortDescription,
  category,
  postTitle,
  postCategory,
  postTags,
  postExcerpt,
  selectedText,
  onApply,
}: AIPanelProps) {
  const isBlog = context === "blog";

  // ── Measure real admin header height so panel starts exactly below it ─────
  const [topOffset, setTopOffset] = useState(64);

  useLayoutEffect(() => {
    function measure() {
      const header = document.querySelector<HTMLElement>('header');
      if (header) setTopOffset(header.offsetHeight);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen]);

  const [tab, setTab]                   = useState<AITab>("generate");
  const [titleInput, setTitleInput]     = useState("");
  const [generateMode, setGenerateMode] = useState<GenerateMode>("full");
  const [isLoading, setLoading]         = useState(false);
  const [loadingMsg, setLoadingMsg]     = useState("");
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [result, setResult]             = useState<Record<string, any> | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [rewriteText, setRewriteText]   = useState(selectedText ?? "");
  const [rewriteMode, setRewriteMode]   = useState<RewriteMode>("rewrite");
  const [rewriteResult, setRewriteResult] = useState("");

  useEffect(() => {
    setTitleInput(isBlog ? (postTitle ?? "") : (productName ?? ""));
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [isBlog, postTitle, productName]);

  useEffect(() => {
    if (selectedText) setRewriteText(selectedText);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [selectedText]);

  const clearResults = () => { setResult(null); setError(""); setSuccess(""); setRewriteResult(""); };
  const switchTab = (t: AITab) => { setTab(t); clearResults(); };

  // ── Core generate with cycling loading messages ──────────────────────────────

  const generate = useCallback(async (type: string, ctx: Record<string, any>) => {
    setLoading(true);
    setError("");
    setSuccess("");
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const timer = setInterval(() => { idx = (idx + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[idx]); }, 1800);
    try {
      const resp = await callAI(type, ctx, context);
      setSettingsLoaded(resp._meta?.settingsLoaded ?? false);
      return resp.data;
    } catch (e: any) {
      setError(e.message ?? "AI generation failed");
      return null;
    } finally {
      clearInterval(timer);
      setLoading(false);
      setLoadingMsg("");
    }
  }, [context]);

  // ── Validate ─────────────────────────────────────────────────────────────────

  const validate = () => {
    if (!titleInput.trim()) {
      setError(isBlog
        ? "Post title is required before generating content."
        : "Product name is required before generating content.");
      return false;
    }
    return true;
  };

  // ── Generate by mode ─────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!validate()) return;
    clearResults();
    let data: Record<string, any> | null = null;

    if (generateMode === "seo") {
      data = await generate("seo", isBlog
        ? { title: titleInput, excerpt: postExcerpt, contentType: "blog" }
        : { name: titleInput, shortDescription, contentType: "product" });
    } else if (generateMode === "faq") {
      data = await generate("faq", isBlog
        ? { name: titleInput, shortDescription: postExcerpt }
        : { name: titleInput, shortDescription });
    } else {
      data = await generate(isBlog ? "blog_post" : "product_content", isBlog
        ? { title: titleInput, category: postCategory, tags: postTags, excerpt: postExcerpt }
        : { name: titleInput, shortDescription, category });
    }

    if (data) {
      setResult(data);
      setSuccess("Content generated — review sections below.");
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  // ── Apply all ────────────────────────────────────────────────────────────────

  const applyAll = () => {
    if (!result) return;
    const p: AIApplyPayload = {};
    if (isBlog) {
      if (result.title)           p.title           = result.title;
      if (result.excerpt)         p.excerpt         = result.excerpt;
      if (result.content)         p.content         = result.content;
      if (result.metaTitle)       { p.metaTitle = result.metaTitle; p.seoTitle = result.metaTitle; }
      if (result.metaDescription) { p.metaDescription = result.metaDescription; p.seoDescription = result.metaDescription; }
      if (result.suggestedSlug)   p.suggestedSlug   = result.suggestedSlug;
      if (result.internalLinkSuggestions) p.internalLinkSuggestions = result.internalLinkSuggestions;
      if (result.faqs)            p.blogFaqs        = result.faqs.map((f: any, i: number) => ({ id: `ai-faq-${i}`, question: f.question, answer: f.answer }));
    } else {
      if (result.title)           p.name            = result.title;
      if (result.shortDescription) p.shortDescription = result.shortDescription;
      if (result.description)     p.description     = result.description;
      if (result.specs)           p.attributes      = result.specs.map((s: any, i: number) => ({ id: `ai-${i}`, label: s.label ?? "", value: s.value ?? "" }));
      if (result.faqs)            p.faqs            = result.faqs.map((f: any, i: number) => ({ id: `ai-faq-${i}`, question: f.question ?? "", answer: f.answer ?? "" }));
      if (result.seoTitle)        p.seoTitle        = result.seoTitle;
      if (result.seoDescription)  p.seoDescription  = result.seoDescription;
      if (result.seoKeywords)     p.seoKeywords     = result.seoKeywords;
    }
    onApply(p);
    onClose();
  };

  // ── Rewrite ──────────────────────────────────────────────────────────────────

  const handleRewrite = async () => {
    if (!rewriteText.trim()) { setError("Please paste some text to transform."); return; }
    clearResults();
    const data = await generate(rewriteMode, { text: rewriteText });
    if (data) {
      setRewriteResult(data.result ?? data.improved ?? data.content ?? "");
      setSuccess("Text transformed successfully.");
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  if (!isOpen) return null;

  const currentMode = GENERATE_MODES.find(m => m.id === generateMode);

  return (
    <>
      {/* Backdrop — starts exactly below measured admin header */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-black/30 backdrop-blur-[2px]"
        style={{ top: topOffset }}
        onClick={onClose}
      />

      {/* Panel — top offset is dynamically measured from actual header height */}
      <div
        className="fixed bottom-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl dark:bg-gray-950 sm:w-[480px] sm:border-l sm:border-gray-200 sm:dark:border-gray-800"
        style={{ top: topOffset }}
      >

        {/* ── Header — flex-shrink-0 ────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.09 6.26L20 9.27l-4.33 4.2L16.91 20 12 16.9 7.09 20l1.24-6.53L4 9.27l5.91-1.01z"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">AI Content Engine</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`rounded-full px-2 py-px text-[9px] font-bold uppercase ${isBlog ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" : "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"}`}>
                  {isBlog ? "Blog Post" : "Product"}
                </span>
                {settingsLoaded && (
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Admin settings
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Tabs — flex-shrink-0 ──────────────────────────────────────── */}
        <div className="flex flex-shrink-0 border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/60">
          {([
            ["generate", "✦", isBlog ? "Full Post" : "Content"],
            ["rewrite",  "↺", "Transform"],
          ] as [AITab, string, string][]).map(([id, icon, label]) => (
            <button key={id} type="button" onClick={() => switchTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${tab === id ? "border-b-2 border-brand-500 bg-white text-brand-600 dark:bg-gray-950 dark:text-brand-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
              <span>{icon}</span>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Scrollable Body — flex-1 min-h-0 IS THE OVERFLOW FIX ─────── */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          {/* ── GENERATE TAB ──────────────────────────────────────────── */}
          {tab === "generate" && (
            <div className="space-y-4 p-5">

              {/* Title input — required */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {isBlog ? "Post Title" : "Product Name"}
                    <span className="ml-1 text-error-500">*</span>
                  </label>
                  {!titleInput.trim() && (
                    <span className="text-[10px] text-gray-400">Required to generate</span>
                  )}
                </div>
                <input
                  value={titleInput}
                  onChange={(e) => { setTitleInput(e.target.value); if (error) setError(""); }}
                  placeholder={isBlog ? "Enter the blog post title…" : "Enter the product name…"}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white ${
                    error && !titleInput.trim()
                      ? "border-error-400 bg-error-50/40 focus:border-error-400 focus:ring-error-400/20 dark:border-error-500/50"
                      : "border-gray-200 bg-white focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700"
                  }`}
                />
              </div>

              {/* Content type selector */}
              <div>
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-200">What to generate</p>
                <div className="grid grid-cols-2 gap-2">
                  {GENERATE_MODES.map((m) => (
                    <button key={m.id} type="button" onClick={() => setGenerateMode(m.id)}
                      className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                        generateMode === m.id
                          ? "border-brand-400 bg-brand-50 ring-1 ring-brand-400/30 dark:border-brand-500/50 dark:bg-brand-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{m.icon}</span>
                        <span className={`text-xs font-bold ${generateMode === m.id ? "text-brand-700 dark:text-brand-300" : "text-gray-700 dark:text-gray-200"}`}>{m.label}</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${generateMode === m.id ? "text-brand-600/80 dark:text-brand-400/80" : "text-gray-400"}`}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-3 py-2.5 dark:border-error-500/30 dark:bg-error-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-error-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs font-medium text-error-600 dark:text-error-400">{error}</p>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{success}</p>
                </div>
              )}

              {/* Loading animation */}
              {isLoading && (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 py-10 dark:border-violet-500/30 dark:from-violet-500/10 dark:to-blue-500/10">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-300/30 dark:bg-violet-500/20" style={{ animationDuration: "1.5s" }} />
                    <div className="absolute inset-1.5 animate-ping rounded-full bg-violet-300/20 dark:bg-violet-500/10" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
                    <svg className="relative h-6 w-6 animate-spin text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{loadingMsg}</p>
                    <p className="mt-1 text-[11px] text-gray-400">Using admin instructions · 5–20 seconds</p>
                  </div>
                </div>
              )}

              {/* Structured result sections */}
              {result && !isLoading && (
                <GenerateResultPanel
                  result={result}
                  isBlog={isBlog}
                  onApply={onApply}
                  onClear={clearResults}
                />
              )}
            </div>
          )}

          {/* ── REWRITE TAB ───────────────────────────────────────────── */}
          {tab === "rewrite" && (
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-500/30 dark:from-orange-500/10 dark:to-amber-500/10">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Transform Text</p>
                <p className="mt-0.5 text-xs text-gray-500">Rewrite, expand, or SEO-optimize using your admin tone and keyword settings.</p>
              </div>

              {/* Mode selector */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Mode</p>
                <div className="flex gap-1.5">
                  {([
                    ["rewrite",      "↺ Rewrite",  "Improve clarity"],
                    ["expand",       "↕ Expand",   "Add more detail"],
                    ["seo_optimize", "🔍 SEO",     "Keyword-optimize"],
                  ] as [RewriteMode, string, string][]).map(([m, label, tip]) => (
                    <button key={m} type="button" onClick={() => setRewriteMode(m)} title={tip}
                      className={`flex-1 rounded-xl py-2.5 text-[11px] font-bold transition-all ${rewriteMode === m ? "bg-brand-500 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-200">Input Text</label>
                  <span className="text-[10px] text-gray-400">{rewriteText.length} chars</span>
                </div>
                <textarea value={rewriteText} onChange={(e) => { setRewriteText(e.target.value); if (error) setError(""); }}
                  rows={6} placeholder="Paste the text you want to transform…"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-3 py-2.5 dark:border-error-500/30 dark:bg-error-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-error-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs font-medium text-error-600 dark:text-error-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{success}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-orange-200 bg-orange-50 py-6 dark:border-orange-500/20 dark:bg-orange-500/5">
                  <svg className="h-5 w-5 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{loadingMsg}</p>
                </div>
              )}

              {rewriteResult && !isLoading && (
                <div className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                  <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Output</span>
                    <div className="flex items-center gap-2">
                      <CopyBtn text={rewriteResult} />
                      <button type="button" onClick={() => { setRewriteText(rewriteResult); setRewriteResult(""); clearResults(); }}
                        className="text-[10px] font-semibold text-brand-600 hover:underline dark:text-brand-400">Use as input →</button>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 dark:bg-gray-900">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-200">{rewriteResult}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer — flex-shrink-0 ────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          {tab === "generate" && (
            <div className="space-y-2.5">
              {result && !isLoading && (
                <button type="button" onClick={applyAll}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.99]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Apply All to {isBlog ? "Post" : "Product"} Form
                </button>
              )}
              <button type="button" onClick={handleGenerate} disabled={isLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] ${
                  result && !isLoading
                    ? "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    : "bg-gradient-to-r from-violet-500 to-blue-600 text-white shadow-sm hover:from-violet-600 hover:to-blue-700"
                }`}>
                {isLoading
                  ? <><Spinner /> {loadingMsg || "Generating…"}</>
                  : result
                    ? `↺ Regenerate ${currentMode?.label}`
                    : `✨ Generate ${currentMode?.label}`
                }
              </button>
            </div>
          )}

          {tab === "rewrite" && (
            <div className="space-y-2.5">
              {rewriteResult && !isLoading && (
                <button type="button" onClick={() => { onApply({ description: rewriteResult, content: rewriteResult }); onClose(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 active:scale-[0.99]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Apply to Editor
                </button>
              )}
              <button type="button" onClick={handleRewrite} disabled={isLoading || !rewriteText.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]">
                {isLoading
                  ? <><Spinner /> {loadingMsg || "Processing…"}</>
                  : rewriteResult
                    ? "↺ Transform Again"
                    : `✨ ${rewriteMode === "rewrite" ? "Rewrite" : rewriteMode === "expand" ? "Expand" : "SEO Optimize"}`
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
