"use client";

import React, { useState, useEffect } from "react";
import { useAllAISettings, useUpdateAISetting, useAIStats, useAILogs } from "@/hooks/useAISettings";
import type { AIContext, AISetting, ContentRules } from "@/types/ai-settings.types";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES = ["professional", "premium", "informative", "conversational", "technical", "friendly", "persuasive"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const CONTEXTS: { key: AIContext; label: string; color: string; description: string }[] = [
  {
    key: "product",
    label: "Product Content",
    color: "brand",
    description: "Controls AI for product descriptions, specs, FAQs, and rewrite actions in ProductForm.",
  },
  {
    key: "blog",
    label: "Blog Content",
    color: "violet",
    description: "Controls AI for full blog post generation, headings, FAQ sections, and SEO in PostForm.",
  },
  {
    key: "global",
    label: "Global Fallback",
    color: "gray",
    description: "Used when no context-specific settings are found. Acts as the base configuration.",
  },
];

const RULE_LABELS: { key: keyof ContentRules; label: string; desc: string }[] = [
  { key: "include_cta",              label: "Include CTA",              desc: "Always add a call-to-action" },
  { key: "include_benefits",         label: "Include Benefits",         desc: "Highlight benefits, not just features" },
  { key: "include_specs",            label: "Include Specs",            desc: "Generate technical specifications (products)" },
  { key: "include_faqs",             label: "Include FAQs",             desc: "Generate FAQ section (products)" },
  { key: "include_faq",              label: "Include FAQ",              desc: "Add FAQ section (blog posts)" },
  { key: "include_headings",         label: "Use H2/H3 Headings",       desc: "Structure content with proper SEO headings" },
  { key: "avoid_keyword_stuffing",   label: "Avoid Keyword Stuffing",   desc: "Natural keyword integration only" },
  { key: "suggest_internal_links",   label: "Suggest Internal Links",   desc: "Add internal link suggestions at end" },
];

// ─── Context Editor Card ───────────────────────────────────────────────────────

function ContextEditor({
  ctx,
  setting,
  onSave,
  isSaving,
}: {
  ctx: typeof CONTEXTS[0];
  setting: AISetting | undefined;
  onSave: (data: Partial<AISetting>) => void;
  isSaving: boolean;
}) {
  const [systemPrompt,   setSystemPrompt]   = useState(setting?.systemPrompt ?? "");
  const [tone,           setTone]           = useState(setting?.tone ?? "professional");
  const [targetKeywords, setTargetKeywords] = useState(setting?.targetKeywords ?? "");
  const [language,       setLanguage]       = useState(setting?.language ?? "English");
  const [contentRules,   setContentRules]   = useState<ContentRules>(setting?.contentRules ?? {});
  const [minWordCount,   setMinWordCount]   = useState((setting?.contentRules as any)?.min_word_count ?? 0);
  const [isActive,       setIsActive]       = useState(setting?.isActive ?? true);
  const [saved,          setSaved]          = useState(false);

  const toggleRule = (key: keyof ContentRules) => {
    setContentRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    const rules: ContentRules = { ...contentRules };
    if (minWordCount > 0) (rules as any).min_word_count = minWordCount;
    else delete (rules as any).min_word_count;

    await onSave({ systemPrompt, tone, targetKeywords, language, contentRules: rules, isActive });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const colorMap: Record<string, string> = {
    brand:  "bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30",
    violet: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30",
    gray:   "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
  };
  const badgeMap: Record<string, string> = {
    brand:  "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    gray:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorMap[ctx.color]}`}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeMap[ctx.color]}`}>
              {ctx.key.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">{ctx.label}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">{ctx.description}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Active</span>
          <div
            onClick={() => setIsActive((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${isActive ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
        </label>
      </div>

      <div className="space-y-4">
        {/* System Prompt */}
        <div>
          <Label>
            Custom Instructions
            <span className="ml-1 text-[10px] font-normal text-gray-400">(used as AI system context)</span>
          </Label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            placeholder={`Example: "Always write in premium tone targeting Indian buyers. Include benefits, use SEO keywords naturally. Avoid generic content."`}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <p className="mt-0.5 text-[10px] text-gray-400">
            {systemPrompt.length}/5000 chars · This is injected as the AI system prompt before every generation
          </p>
        </div>

        {/* Tone + Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tone</Label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm capitalize dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {TONES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Target Keywords */}
        <div>
          <Label>
            Target Keywords
            <span className="ml-1 text-[10px] font-normal text-gray-400">(comma-separated)</span>
          </Label>
          <input
            value={targetKeywords}
            onChange={(e) => setTargetKeywords(e.target.value)}
            placeholder="prefab cabin, modular building, portable office India"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {targetKeywords.split(",").filter(Boolean).map((kw, i) => (
              <span key={i} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {kw.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Content Rules */}
        <div>
          <Label>Content Rules</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RULE_LABELS.map(({ key, label, desc }) => (
              <label key={key} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-white p-2.5 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                <input
                  type="checkbox"
                  checked={!!(contentRules as any)[key]}
                  onChange={() => toggleRule(key)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-brand-500"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Min word count */}
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Min Word Count</Label>
          <input
            type="number"
            min={0}
            max={3000}
            step={100}
            value={minWordCount}
            onChange={(e) => setMinWordCount(parseInt(e.target.value) || 0)}
            className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <span className="text-xs text-gray-400">words (0 = no minimum)</span>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? "Saving…" : "Save Settings"}
          </Button>
          {saved && <span className="text-sm font-semibold text-success-600">✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Prompt Preview ────────────────────────────────────────────────────────────

function PromptPreview({ setting }: { setting: AISetting | undefined }) {
  if (!setting) return null;
  const rules = setting.contentRules ?? {};
  const constraints: string[] = [
    "Always respond with valid JSON only. No markdown fences.",
    "Never produce generic or placeholder content.",
  ];
  if ((rules as any).avoid_keyword_stuffing) constraints.push("Use keywords naturally.");
  if ((rules as any).include_benefits)       constraints.push("Always highlight benefits.");
  if ((rules as any).include_cta)            constraints.push("Always include a call-to-action.");
  if ((rules as any).suggest_internal_links) constraints.push("Suggest 2-3 internal link anchors.");
  if ((rules as any).include_headings)       constraints.push("Use H2/H3 heading hierarchy.");

  const preview = [
    `ROLE: Professional content writer & SEO expert for Saman Prefab`,
    ``,
    `ADMIN INSTRUCTIONS:`,
    setting.systemPrompt || "(empty — using default)",
    ``,
    `TONE: ${setting.tone ?? "professional"}`,
    setting.targetKeywords ? `TARGET KEYWORDS: ${setting.targetKeywords}` : "(no keywords set)",
    `LANGUAGE: ${setting.language ?? "English"}`,
    ``,
    `CONSTRAINTS:`,
    ...constraints.map((c) => `- ${c}`),
  ].join("\n");

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Prompt Preview</p>
        <button
          onClick={() => navigator.clipboard.writeText(preview)}
          className="text-[10px] font-semibold text-gray-500 hover:text-gray-300"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-gray-300 whitespace-pre-wrap">{preview}</pre>
    </div>
  );
}

// ─── Stats Card ────────────────────────────────────────────────────────────────

function StatsCard() {
  const { data: stats } = useAIStats();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Total Generations", value: stats.total, color: "text-brand-600" },
        { label: "Successful",        value: stats.success, color: "text-success-600" },
        { label: "Failed",            value: stats.failed, color: "text-error-500" },
        { label: "Avg Duration",      value: `${stats.avgDurationMs}ms`, color: "text-gray-600" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Logs Table ────────────────────────────────────────────────────────────────

function LogsTable() {
  const { data: logs = [], isLoading } = useAILogs();

  const ACTION_COLOR: Record<string, string> = {
    product_content: "text-brand-600 bg-brand-50",
    blog_post:       "text-violet-600 bg-violet-50",
    seo:             "text-green-600 bg-green-50",
    faq:             "text-amber-600 bg-amber-50",
    rewrite:         "text-orange-600 bg-orange-50",
    expand:          "text-blue-600 bg-blue-50",
    seo_optimize:    "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <p className="text-sm font-bold text-gray-700 dark:text-white">Recent Generations</p>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading logs…</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No AI generations yet. Start using the AI assistant in Products or Blog.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Action</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Context</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Input</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-gray-400 lg:table-cell">Duration</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Status</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-gray-400 xl:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ACTION_COLOR[log.actionType] ?? "text-gray-500 bg-gray-100"}`}>
                      {log.actionType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 capitalize dark:bg-gray-800">
                      {log.context}
                    </span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-xs text-gray-500">{log.inputSummary || "—"}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-400 lg:table-cell">
                    {log.durationMs ? `${log.durationMs}ms` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {log.success ? (
                      <span className="text-xs font-semibold text-success-600">✓ OK</span>
                    ) : (
                      <span className="text-xs font-semibold text-error-500" title={log.errorMessage ?? ""}>✗ Fail</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-400 xl:table-cell">
                    {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AISettingsPage() {
  const { data: settings = [], isLoading } = useAllAISettings();
  const updateMutation = useUpdateAISetting();
  const [activeCtx, setActiveCtx] = useState<AIContext>("product");
  const [previewCtx, setPreviewCtx] = useState<AIContext>("product");

  const settingMap = Object.fromEntries(settings.map((s) => [s.context, s]));

  const handleSave = async (data: Partial<AISetting>) => {
    await updateMutation.mutateAsync({ context: activeCtx, data });
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l2.09 6.26L20 9.27l-4.33 4.2L16.91 20 12 16.9 7.09 20l1.24-6.53L4 9.27l5.91-1.01z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">AI Writing Engine</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure AI instructions, tone, and content rules for products and blog posts. All settings are injected directly into AI prompts.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsCard />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-pulse text-sm text-gray-400">Loading AI settings…</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          {/* Left: Config tabs */}
          <div className="space-y-4">
            {/* Context tabs */}
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
              {CONTEXTS.map((ctx) => (
                <button
                  key={ctx.key}
                  onClick={() => { setActiveCtx(ctx.key); setPreviewCtx(ctx.key); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    activeCtx === ctx.key
                      ? "bg-white shadow-sm text-gray-800 dark:bg-gray-800 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>

            {CONTEXTS.filter((c) => c.key === activeCtx).map((ctx) => (
              <ContextEditor
                key={`${ctx.key}-${settingMap[ctx.key]?.id ?? 'new'}`}
                ctx={ctx}
                setting={settingMap[ctx.key]}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
              />
            ))}
          </div>

          {/* Right: Live prompt preview */}
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-bold text-gray-600 dark:text-gray-400">Prompt Preview</p>
              <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
                {CONTEXTS.map((ctx) => (
                  <button
                    key={ctx.key}
                    onClick={() => setPreviewCtx(ctx.key)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      previewCtx === ctx.key
                        ? "bg-white shadow-sm text-gray-700 dark:bg-gray-800 dark:text-white"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {ctx.key}
                  </button>
                ))}
              </div>
            </div>
            <PromptPreview setting={settingMap[previewCtx]} />
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">Usage Logs</h3>
        <LogsTable />
      </div>
    </div>
  );
}
