"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import MediaLibrary from "@/components/media/MediaLibrary";
import { useCreatePost, useUpdatePost, usePostCategories, usePostTags } from "@/hooks/usePosts";
import { Post, PostStatus, type CreatePostPayload } from "@/types/post.types";
import { API_CONFIG } from "@/lib/api";
import AIPanel, { type AIApplyPayload } from "@/components/products/AIPanel";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full rounded-xl border border-gray-200 bg-gray-50 animate-pulse dark:border-gray-800 dark:bg-gray-900/50" />
    ),
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "basic" | "content" | "media" | "seo" | "social";
type SaveState = "idle" | "loading" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calcSeoScore(
  metaTitle: string,
  metaDesc: string,
  slug: string,
  content: string,
  featuredImage: string
): { score: number; color: string; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  const tLen = metaTitle.length;
  if (tLen >= 50 && tLen <= 60) score += 25;
  else if (tLen >= 30 && tLen < 50) score += 12;
  else if (tLen === 0) suggestions.push("Add a meta title (50–60 characters ideal)");
  else if (tLen > 60) suggestions.push("Meta title is too long — keep it under 60 characters");
  else suggestions.push("Meta title is too short — aim for 50–60 characters");

  const dLen = metaDesc.length;
  if (dLen >= 150 && dLen <= 160) score += 25;
  else if (dLen >= 100 && dLen < 150) score += 12;
  else if (dLen === 0) suggestions.push("Add a meta description (150–160 characters ideal)");
  else if (dLen > 160) suggestions.push("Meta description is too long — keep it under 160 characters");
  else suggestions.push("Meta description is too short — aim for 150–160 characters");

  const plain = content.replace(/<[^>]+>/g, "").trim();
  if (plain.length >= 500) score += 25;
  else if (plain.length >= 200) { score += 12; suggestions.push("Add more content — 500+ words improves SEO ranking"); }
  else if (plain.length > 0) { score += 6; suggestions.push("Content is too thin — aim for 500+ words"); }
  else suggestions.push("Add post content");

  if (featuredImage) score += 15;
  else suggestions.push("Add a featured image for better social sharing and SEO");

  if (slug.length > 0 && slug.length <= 60) score += 10;
  else if (slug.length > 60) suggestions.push("Keep the URL slug under 60 characters");

  const color = score >= 70 ? "text-success-600" : score >= 40 ? "text-warning-600" : "text-error-600";
  return { score: Math.min(score, 100), color, suggestions };
}

// ─── SEO Char Bar ─────────────────────────────────────────────────────────────

function SeoCharBar({ current, ideal, max }: { current: number; ideal: [number, number]; max: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const isIdeal = current >= ideal[0] && current <= ideal[1];
  const isOver = current > ideal[1];
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-full rounded-full transition-all duration-300 ${isIdeal ? "bg-success-500" : isOver ? "bg-error-500" : "bg-warning-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "basic", label: "Basic Info", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: "content", label: "Content", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { id: "media", label: "Media", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: "seo", label: "SEO", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { id: "social", label: "Social", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
];

const STATUS_CONFIG: Record<PostStatus, { label: string; badge: string }> = {
  [PostStatus.PUBLISHED]: { label: "Published", badge: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" },
  [PostStatus.DRAFT]:     { label: "Draft",     badge: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400" },
};

// ─── PostForm ─────────────────────────────────────────────────────────────────

interface PostFormProps {
  initialData?: Post;
  onSuccess?: (post: Post) => void;
  onCancel?: () => void;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: PostStatus;
  categoryIds: string[];
  tagIds: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

const DEFAULT_FORM: PostFormData = {
  title: "", slug: "", excerpt: "", content: "", featuredImage: "",
  status: PostStatus.DRAFT, categoryIds: [], tagIds: [],
  metaTitle: "", metaDescription: "", canonicalUrl: "",
  ogTitle: "", ogDescription: "", ogImage: "",
  twitterTitle: "", twitterDescription: "", twitterImage: "",
};

function mapPostToForm(post: Post): PostFormData {
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    content: (post.content as any)?.html ?? "",
    featuredImage: post.featuredImage ?? "",
    status: post.status ?? PostStatus.DRAFT,
    categoryIds: (post.categories ?? []).map((c) => c.id),
    tagIds: (post.tags ?? []).map((t) => t.id),
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ogTitle: post.ogTitle ?? "",
    ogDescription: post.ogDescription ?? "",
    ogImage: post.ogImage ?? "",
    twitterTitle: post.twitterTitle ?? "",
    twitterDescription: post.twitterDescription ?? "",
    twitterImage: post.twitterImage ?? "",
  };
}

export default function PostForm({ initialData, onSuccess, onCancel }: PostFormProps) {
  const isEditing = !!initialData;

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const { data: categories = [] } = usePostCategories();
  const { data: tags = [] } = usePostTags();

  // Use initialData.id as part of state key to force form reset when editing different post
  const [form, setForm] = useState<PostFormData>(() =>
    initialData ? mapPostToForm(initialData) : DEFAULT_FORM
  );
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"featured" | "og" | "twitter" | "content">("featured");
  const [isAIPanelOpen, setAIPanelOpen] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }, [fieldErrors]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: !slugTouched ? slugify(title) : prev.slug,
    }));
    if (fieldErrors.title) setFieldErrors((prev) => { const n = { ...prev }; delete n.title; return n; });
  }, [slugTouched, fieldErrors]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  }, []);

  const toggleTag = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
  }, []);

  const handleAIApply = useCallback((payload: AIApplyPayload) => {
    setForm((prev) => ({
      ...prev,
      ...(payload.title            && { title: payload.title }),
      ...(payload.excerpt          && { excerpt: payload.excerpt }),
      ...(payload.content          && { content: payload.content }),
      ...(payload.metaTitle        && { metaTitle: payload.metaTitle }),
      ...(payload.metaDescription  && { metaDescription: payload.metaDescription }),
      ...(payload.suggestedSlug && !slugTouched && { slug: payload.suggestedSlug }),
      ...(payload.title && !slugTouched && { slug: slugify(payload.title) }),
    }));
    if (payload.content) setActiveTab("content");
    else if (payload.metaTitle) setActiveTab("seo");
  }, [slugTouched]);

  const openMediaPicker = (target: typeof mediaTarget) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  const handleMediaConfirm = useCallback((urls: string[]) => {
    const url = urls[0] ?? "";
    if (mediaTarget === "content" && (window as any).__tinymceImageCb) {
      // Editor image: call TinyMCE callback to insert into content
      (window as any).__tinymceImageCb(API_CONFIG.assetUrl(url));
      (window as any).__tinymceImageCb = null;
    } else {
      setForm((prev) => {
        if (mediaTarget === "featured") return { ...prev, featuredImage: url };
        if (mediaTarget === "og") return { ...prev, ogImage: url };
        return { ...prev, twitterImage: url };
      });
    }
    setMediaOpen(false);
  }, [mediaTarget]);

  const seo = useMemo(
    () => calcSeoScore(form.metaTitle, form.metaDescription, form.slug, form.content, form.featuredImage),
    [form.metaTitle, form.metaDescription, form.slug, form.content, form.featuredImage]
  );

  const handleSubmit = async (status?: PostStatus) => {
    setError("");
    setFieldErrors({});

    const targetStatus = status ?? form.status;

    if (!form.title.trim()) {
      setFieldErrors({ title: "Title is required" });
      setActiveTab("basic");
      return;
    }
    if (form.title.trim().length < 5) {
      setFieldErrors({ title: "Title must be at least 5 characters" });
      setActiveTab("basic");
      return;
    }
    if (!form.slug.trim()) {
      setFieldErrors({ slug: "Slug is required" });
      setActiveTab("basic");
      return;
    }
    if (targetStatus === PostStatus.PUBLISHED && !form.content.trim()) {
      setFieldErrors({ content: "Content is required before publishing" });
      setError("Cannot publish: post content is empty. Add content or save as Draft.");
      setActiveTab("content");
      return;
    }

    setSaveState("loading");

    const payload: CreatePostPayload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content ? { html: form.content } : undefined,
      featuredImage: form.featuredImage || undefined,
      status: targetStatus,
      categoryIds: form.categoryIds,
      tagIds: form.tagIds,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      canonicalUrl: form.canonicalUrl || undefined,
      ogTitle: form.ogTitle || undefined,
      ogDescription: form.ogDescription || undefined,
      ogImage: form.ogImage || undefined,
      twitterTitle: form.twitterTitle || undefined,
      twitterDescription: form.twitterDescription || undefined,
      twitterImage: form.twitterImage || undefined,
    };

    try {
      let post: Post;
      if (isEditing && initialData) {
        post = await updateMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        post = await createMutation.mutateAsync(payload);
      }
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2000);
      onSuccess?.(post);
    } catch (err: any) {
      setSaveState("error");
      if (Array.isArray(err?.details) && err.details.length > 0) {
        const fields: Record<string, string> = {};
        let firstFieldTab: Tab | null = null;
        err.details.forEach((d: { field: string; message: string }) => {
          if (d.field) {
            fields[d.field] = d.message;
            if (!firstFieldTab) {
              if (d.field === "title" || d.field === "slug") firstFieldTab = "basic";
              else if (d.field === "content") firstFieldTab = "content";
              else if (d.field === "featuredImage") firstFieldTab = "media";
              else if (d.field === "metaTitle" || d.field === "metaDescription") firstFieldTab = "seo";
            }
          }
        });
        setFieldErrors(fields);
        if (firstFieldTab) setActiveTab(firstFieldTab);
        setError(`Validation failed: ${err.details[0].message}`);
      } else if (err?.code === "SLUG_CONFLICT" || (err?.message || "").toLowerCase().includes("slug")) {
        setFieldErrors({ slug: "This URL slug is already in use — change it and try again" });
        setError("A post with this slug already exists. Please use a different URL slug.");
        setActiveTab("basic");
      } else {
        setError(err?.message || "Failed to save post. Please try again.");
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CONFIG[form.status].badge}`}>
            {STATUS_CONFIG[form.status].label}
          </span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value={PostStatus.DRAFT}>Draft</option>
            <option value={PostStatus.PUBLISHED}>Published</option>
          </select>
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          {/* AI button */}
          <button
            type="button"
            onClick={() => setAIPanelOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 px-3 py-2 text-xs font-bold text-violet-700 transition-all hover:from-violet-100 hover:to-blue-100 hover:shadow-sm dark:border-violet-500/30 dark:from-violet-500/10 dark:to-blue-500/10 dark:text-violet-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.09 6.26L20 9.27l-4.33 4.2L16.91 20 12 16.9 7.09 20l1.24-6.53L4 9.27l5.91-1.01z"/>
            </svg>
            AI
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(PostStatus.DRAFT)}
            disabled={isPending}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit(PostStatus.PUBLISHED)}
            disabled={isPending}
          >
            {saveState === "loading" ? "Publishing…" : saveState === "success" ? "Saved ✓" : isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* ── Main editor area ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left — tabbed editor */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === t.id
                    ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span className="opacity-70">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── TAB: BASIC ── */}
            {activeTab === "basic" && (
              <div className="space-y-5">
                <div>
                  <Label>Post Title <span className="text-error-500">*</span></Label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="Enter post title…"
                    className="text-lg font-semibold"
                  />
                  {fieldErrors.title && <p className="mt-1 text-xs text-error-500">{fieldErrors.title}</p>}
                </div>

                <div>
                  <Label>URL Slug <span className="text-error-500">*</span></Label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-800">
                    <span className="shrink-0 text-xs text-gray-400">/blog/</span>
                    <input
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="post-url-slug"
                      className="flex-1 bg-transparent py-2 text-sm outline-none dark:text-white"
                    />
                  </div>
                  {fieldErrors.slug
                    ? <p className="mt-1 text-xs text-error-500">{fieldErrors.slug}</p>
                    : <p className="mt-0.5 text-[11px] text-gray-400">Lowercase letters, numbers, and hyphens only</p>
                  }
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short summary shown in post listings…"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-0.5 text-[11px] text-gray-400">{form.excerpt.length} / 300 characters</p>
                </div>

                {/* Categories */}
                <div>
                  <Label>Categories</Label>
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400">No categories yet — create some in Blog › Categories.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            form.categoryIds.includes(cat.id)
                              ? "bg-brand-500 text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:border-brand-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-400">No tags yet — create some in Blog › Tags.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            form.tagIds.includes(tag.id)
                              ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                          }`}
                        >
                          # {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: CONTENT ── */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Rich text editor — supports headings, lists, images, embeds, and more.</p>
                {fieldErrors.content && (
                  <p className="rounded-lg bg-error-50 px-4 py-2 text-sm font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
                    {fieldErrors.content}
                  </p>
                )}
                <RichTextEditor
                  value={form.content}
                  onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
                  placeholder="Start writing your post…"
                  minHeight={500}
                  onImagePick={(type) => {
                    setMediaTarget(type as typeof mediaTarget);
                    setMediaOpen(true);
                  }}
                />
              </div>
            )}

            {/* ── TAB: MEDIA ── */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <div>
                  <Label>Featured Image</Label>
                  {form.featuredImage ? (
                    <div className="relative mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                      <img
                        src={API_CONFIG.assetUrl(form.featuredImage)}
                        alt="Featured"
                        className="h-64 w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 p-4">
                        <span className="truncate text-xs text-white/80">{form.featuredImage}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openMediaPicker("featured")}
                            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, featuredImage: "" }))}
                            className="rounded-lg bg-error-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openMediaPicker("featured")}
                      className="mt-2 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-sm font-medium">Select Featured Image</span>
                      <span className="text-xs">Click to open Media Library</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: SEO ── */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                {/* SEO Score */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO Score</span>
                    <span className={`text-2xl font-black tabular-nums ${seo.color}`}>
                      {seo.score}<span className="text-sm font-normal text-gray-400">/100</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${seo.score >= 70 ? "bg-success-500" : seo.score >= 40 ? "bg-warning-500" : "bg-error-500"}`}
                      style={{ width: `${seo.score}%` }}
                    />
                  </div>
                  {seo.suggestions.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {seo.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                          <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  {seo.suggestions.length === 0 && (
                    <p className="mt-2 text-xs text-success-600">All SEO checks passed!</p>
                  )}
                </div>

                {/* Meta Title */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <Label>Meta Title</Label>
                    <span className={`text-xs tabular-nums ${
                      form.metaTitle.length >= 50 && form.metaTitle.length <= 60
                        ? "text-success-500" : form.metaTitle.length > 60 ? "text-error-500" : "text-gray-400"
                    }`}>{form.metaTitle.length} / 60</span>
                  </div>
                  <Input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="SEO optimized title (50–60 chars)" />
                  <SeoCharBar current={form.metaTitle.length} ideal={[50, 60]} max={70} />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <Label>Meta Description</Label>
                    <span className={`text-xs tabular-nums ${
                      form.metaDescription.length >= 150 && form.metaDescription.length <= 160
                        ? "text-success-500" : form.metaDescription.length > 160 ? "text-error-500" : "text-gray-400"
                    }`}>{form.metaDescription.length} / 160</span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={form.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief summary for search snippets (150–160 chars)…"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                  <SeoCharBar current={form.metaDescription.length} ideal={[150, 160]} max={180} />
                </div>

                {/* Canonical URL */}
                <div>
                  <Label>Canonical URL</Label>
                  <Input name="canonicalUrl" value={form.canonicalUrl} onChange={handleChange} placeholder="https://samanprefab.com/blog/your-slug (leave blank to auto-generate)" />
                  <p className="mt-0.5 text-[11px] text-gray-400">Use only to avoid duplicate content. Leave blank in most cases.</p>
                </div>

                {/* Google Preview */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Google Search Preview</span>
                  <div className="mt-3 space-y-1">
                    <div className="line-clamp-1 text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer">
                      {form.metaTitle || form.title || "Untitled Post"}
                    </div>
                    <div className="text-[13px] text-[#006621]">
                      https://samanprefab.com › blog › {form.slug || "…"}
                    </div>
                    <div className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {form.metaDescription || "Add a meta description to see how your post appears in search results."}
                    </div>
                  </div>
                </div>

                {/* JSON-LD Note */}
                <div className="rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Article Schema (JSON-LD)</p>
                  <p className="mt-0.5 text-xs text-brand-600/80 dark:text-brand-400/80">
                    Structured data is auto-generated on the frontend using the post title, excerpt, published date, and featured image. No manual input needed.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: SOCIAL ── */}
            {activeTab === "social" && (
              <div className="space-y-8">
                {/* Open Graph */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Open Graph</span>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div>
                    <Label>OG Title</Label>
                    <Input name="ogTitle" value={form.ogTitle} onChange={handleChange} placeholder="Defaults to meta title if empty" />
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <textarea
                      name="ogDescription"
                      value={form.ogDescription}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Defaults to meta description if empty"
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label>OG Image</Label>
                    {form.ogImage ? (
                      <div className="mt-1 flex items-center gap-3">
                        <img src={API_CONFIG.assetUrl(form.ogImage)} alt="OG" className="h-12 w-20 rounded object-cover border border-gray-200" />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openMediaPicker("og")} className="text-xs text-brand-500 hover:underline">Change</button>
                          <button type="button" onClick={() => setForm((p) => ({ ...p, ogImage: "" }))} className="text-xs text-error-500 hover:underline">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => openMediaPicker("og")} className="mt-1 rounded-lg border border-dashed border-gray-200 px-4 py-2 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500">
                        + Select OG Image
                      </button>
                    )}
                    <p className="mt-0.5 text-[11px] text-gray-400">Recommended: 1200×630px. Defaults to featured image if empty.</p>
                  </div>
                </div>

                {/* Twitter Card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Twitter / X Card</span>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div>
                    <Label>Twitter Title</Label>
                    <Input name="twitterTitle" value={form.twitterTitle} onChange={handleChange} placeholder="Defaults to OG title if empty" />
                  </div>
                  <div>
                    <Label>Twitter Description</Label>
                    <textarea
                      name="twitterDescription"
                      value={form.twitterDescription}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Defaults to OG description if empty"
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label>Twitter Image</Label>
                    {form.twitterImage ? (
                      <div className="mt-1 flex items-center gap-3">
                        <img src={API_CONFIG.assetUrl(form.twitterImage)} alt="Twitter" className="h-12 w-20 rounded object-cover border border-gray-200" />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openMediaPicker("twitter")} className="text-xs text-brand-500 hover:underline">Change</button>
                          <button type="button" onClick={() => setForm((p) => ({ ...p, twitterImage: "" }))} className="text-xs text-error-500 hover:underline">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => openMediaPicker("twitter")} className="mt-1 rounded-lg border border-dashed border-gray-200 px-4 py-2 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500">
                        + Select Twitter Image
                      </button>
                    )}
                    <p className="mt-0.5 text-[11px] text-gray-400">Recommended: 1200×600px. Defaults to OG image if empty.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — sidebar info panel */}
        <div className="space-y-4">
          {/* Post Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Post Info</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CONFIG[form.status].badge}`}>
                  {STATUS_CONFIG[form.status].label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Categories</span>
                <span className="font-medium text-gray-800 dark:text-white">{form.categoryIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tags</span>
                <span className="font-medium text-gray-800 dark:text-white">{form.tagIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Words</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>

          {/* SEO Score Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">SEO Score</p>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black tabular-nums ${seo.color}`}>{seo.score}</span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${seo.score >= 70 ? "bg-success-500" : seo.score >= 40 ? "bg-warning-500" : "bg-error-500"}`}
                    style={{ width: `${seo.score}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {seo.score >= 70 ? "Good" : seo.score >= 40 ? "Needs improvement" : "Poor"}
                </p>
              </div>
            </div>
            {seo.suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className="mt-3 text-xs text-brand-500 hover:underline"
              >
                View {seo.suggestions.length} suggestion{seo.suggestions.length > 1 ? "s" : ""} →
              </button>
            )}
          </div>

          {/* Featured Image thumbnail */}
          {form.featuredImage && (
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Featured Image</p>
              <img
                src={API_CONFIG.assetUrl(form.featuredImage)}
                alt="Featured"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 160 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onConfirm={handleMediaConfirm}
        mode="single"
        title={
          mediaTarget === "featured" ? "Select Featured Image" :
          mediaTarget === "content"  ? "Insert Image into Content" :
          mediaTarget === "og"       ? "Select OG Image" : "Select Twitter Image"
        }
        confirmLabel="Use This Image"
      />

      {/* AI Panel */}
      <AIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setAIPanelOpen(false)}
        context="blog"
        postTitle={form.title}
        postCategory={categories.find((c) => form.categoryIds.includes(c.id))?.name ?? ""}
        postTags={tags.filter((t) => form.tagIds.includes(t.id)).map((t) => t.name).join(", ")}
        postExcerpt={form.excerpt}
        onApply={handleAIApply}
      />
    </div>
  );
}
