/**
 * AI Content Engine — DeepSeek via AgentRouter (OpenAI-compatible)
 *
 * Env vars (server-side only — never NEXT_PUBLIC_):
 *   AGENTROUTER_API_KEY  — your AgentRouter API key
 *   AGENTROUTER_BASE_URL — defaults to https://agentrouter.org/v1
 *   AI_MODEL             — defaults to deepseek-v3.2
 */

// ─── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.AGENTROUTER_BASE_URL ?? "https://agentrouter.org/v1";
const MODEL    = process.env.AI_MODEL             ?? "deepseek-v3.2";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  temperature?: number;
  maxTokens?: number;
}

/** Shape returned from GET /api/v1/ai-settings/:context */
export interface AISetting {
  id?: string;
  context: "global" | "product" | "blog";
  systemPrompt: string;
  tone: string;
  targetKeywords: string;
  language: string;
  contentRules: Record<string, any>;
  isActive: boolean;
}

export interface ProductContentResult {
  title: string;
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface BlogContentResult {
  title: string;
  excerpt: string;
  content: string;
  headings: string[];
  faqs: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
  suggestedSlug: string;
  internalLinkSuggestions: string[];
  cta: string;
}

export interface SEOResult {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface FAQResult {
  faqs: { question: string; answer: string }[];
}

export interface RewriteResult {
  result: string;
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

/**
 * Build the structured system prompt from admin AI settings.
 * Combines: ROLE + ADMIN INSTRUCTIONS + TONE + KEYWORDS + CONSTRAINTS
 */
// ─── STRICT SEO CONSTRAINTS ───────────────────────────────────────────────────

const STRICT_SEO_RULES = `
STRICT SEO CONSTRAINTS (HARD LIMITS - NEVER VIOLATE):
- Meta title MUST be ≤ 60 characters (including spaces)
- Meta description MUST be 140–155 characters ONLY (including spaces)
- URL slug MUST be ≤ 60 characters, lowercase, hyphen-separated
- If any field exceeds limits → REWRITE IT BEFORE returning

These are HARD CONSTRAINTS. NEVER violate them.
Validate your output: count characters before finalizing JSON.
`;

export function buildSystemPrompt(settings: AISetting | null, fallbackContext: string): string {
  if (!settings || !settings.isActive) {
    return (
      `ROLE: You are a professional content writer and SEO expert for Saman Prefab — a premium prefab building company in India.\n\n` +
      `${STRICT_SEO_RULES}\n\n` +
      `Always respond with valid JSON only. No markdown fences, no extra text.\n` +
      `All content must be specific, factual, and directly relevant to the given context.`
    );
  }

  const rules = settings.contentRules ?? {};
  const constraints: string[] = [
    "Always respond with valid JSON only. No markdown fences, no code blocks, no extra text.",
    "Never produce generic or placeholder content.",
    "All content must be specific, factual, and directly relevant to the given context.",
  ];

  if (rules.avoid_keyword_stuffing) constraints.push("Use keywords naturally — never keyword-stuff.");
  if (rules.include_benefits)       constraints.push("Always highlight benefits, not just features.");
  if (rules.include_cta)            constraints.push("Always include a clear call-to-action.");
  if (rules.suggest_internal_links) constraints.push("Suggest 2-3 relevant internal link anchors at the end of content.");
  if (rules.include_headings)       constraints.push("Use proper H2/H3 heading hierarchy for SEO.");
  if (rules.min_word_count)         constraints.push(`Minimum content length: ${rules.min_word_count} words.`);

  // STRICT ORDER: System Rules → Global Instructions → Blog Instructions → User Input
  return [
    `ROLE: You are a professional content writer, copywriter, and SEO expert for Saman Prefab — a premium prefab building company in India.`,
    ``,
    STRICT_SEO_RULES.trim(),
    ``,
    `ADMIN INSTRUCTIONS:`,
    settings.systemPrompt.trim() || `Write high-quality ${fallbackContext} content for Saman Prefab.`,
    ``,
    `TONE: ${settings.tone ?? "professional"}`,
    settings.targetKeywords ? `TARGET KEYWORDS: ${settings.targetKeywords}` : "",
    `LANGUAGE: ${settings.language ?? "English"}`,
    ``,
    `CONSTRAINTS:`,
    ...constraints.map((c) => `- ${c}`),
  ].filter(Boolean).join("\n");
}

// ─── Core HTTP caller ──────────────────────────────────────────────────────────

export async function callAIService(
  messages: AIMessage[],
  options: AICallOptions = {}
): Promise<string> {
  const apiKey = process.env.AGENTROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AGENTROUTER_API_KEY is not configured. Add it to your .env.local file.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samanprefab.com";

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": siteUrl,
      "X-Title": "Saman Prefab CMS",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens:  options.maxTokens  ?? 3200,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as any)?.error?.message ||
      (err as any)?.message ||
      `AI API error ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  if (data?.error) {
    throw new Error(data.error?.message ?? data.error?.code ?? JSON.stringify(data.error));
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response");

  if (
    typeof content === "string" &&
    !content.trim().startsWith("{") &&
    !content.trim().startsWith("[") &&
    (content.toLowerCase().includes("unauthorized") ||
      content.toLowerCase().includes("error") ||
      content.toLowerCase().includes("contact support"))
  ) {
    throw new Error(`AgentRouter: ${content.trim()}`);
  }

  return content as string;
}

// ─── Robust JSON parser ────────────────────────────────────────────────────────

export function parseAIJSON<T = Record<string, any>>(raw: string): T {
  try { return JSON.parse(raw) as T; } catch {}

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) as T; } catch {}
  }

  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]) as T; } catch {}
  }

  throw new Error(`AI returned unparseable response: ${raw.substring(0, 200)}`);
}

// ─── SEO Validation ───────────────────────────────────────────────────────────

interface SEOFields {
  metaTitle?: string;
  metaDescription?: string;
  suggestedSlug?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Check SEO fields for violations. ONLY detects issues, does NOT modify values.
 * Returns list of violation messages for AI rewrite instruction.
 */
export function checkSEOViolations(data: SEOFields): string[] {
  const violations: string[] = [];

  // Meta title: max 60 chars
  if (data.metaTitle && data.metaTitle.length > 60) {
    violations.push(`metaTitle is ${data.metaTitle.length} characters (max 60)`);
  }
  if (data.seoTitle && data.seoTitle.length > 60) {
    violations.push(`seoTitle is ${data.seoTitle.length} characters (max 60)`);
  }

  // Meta description: 140-155 chars (strict)
  const desc = data.metaDescription || data.seoDescription;
  if (desc) {
    if (desc.length > 155) {
      violations.push(`metaDescription is ${desc.length} characters (max 155)`);
    } else if (desc.length < 140) {
      violations.push(`metaDescription is ${desc.length} characters (min 140)`);
    }
  }

  // Slug: max 60 chars
  if (data.suggestedSlug && data.suggestedSlug.length > 60) {
    violations.push(`suggestedSlug is ${data.suggestedSlug.length} characters (max 60)`);
  }

  return violations;
}

// ─── Product Content Generator ─────────────────────────────────────────────────

export async function generateProductContent(
  ctx: { name: string; shortDescription?: string; category?: string; specs?: string },
  adminSettings: AISetting | null = null
): Promise<ProductContentResult> {
  const systemPrompt = buildSystemPrompt(adminSettings, "product");
  const keywords = adminSettings?.targetKeywords ?? "prefab, modular, portable cabin";

  const userPrompt = `Generate complete product content for this prefab product.

PRODUCT DETAILS:
- Name: "${ctx.name || "Prefab Structure"}"
- Category: "${ctx.category || "Prefab Buildings"}"
- Short description hint: "${(ctx.shortDescription ?? "").substring(0, 300)}"
${ctx.specs ? `- Known specs: ${ctx.specs}` : ""}

SEO KEYWORDS TO NATURALLY INCLUDE: ${keywords}

Respond ONLY with valid JSON in exactly this shape:
{
  "title": "Optimized product name (max 80 chars, include main keyword)",
  "shortDescription": "2 compelling sentences (max 160 chars). Highlight key benefit + CTA.",
  "description": "<h2>Why Choose This?</h2><p>...</p><h2>Key Features</h2><ul><li>...</li></ul><h2>Applications</h2><p>...</p><h2>Customization Options</h2><p>...</p><p><strong>Get a free quote today</strong> — call us or fill the online form.</p>",
  "specs": [
    { "label": "Material",   "value": "High-grade galvanized steel frame" },
    { "label": "Structure",  "value": "Modular sandwich panel system" },
    { "label": "Assembly",   "value": "2–4 days, 2 workers" },
    { "label": "Lifespan",   "value": "25+ years" },
    { "label": "Warranty",   "value": "5 years structural" }
  ],
  "faqs": [
    { "question": "What sizes are available?", "answer": "We offer 10ft, 20ft, and 40ft standard sizes with custom dimensions available on request." },
    { "question": "How long does installation take?", "answer": "Standard installation is 2–4 days depending on size and site conditions." },
    { "question": "Can it be customized?", "answer": "Yes — layout, finishes, doors, windows, and electrical are all customizable to your requirements." },
    { "question": "What is the delivery timeline?", "answer": "Standard delivery within 7–15 working days across India. Express delivery available." },
    { "question": "Do you provide installation services?", "answer": "Yes, our trained teams handle installation end-to-end across all major Indian cities." }
  ],
  "seoTitle": "SEO title 50–60 chars STRICT",
  "seoDescription": "Meta description 140–155 chars STRICT. NEVER exceed 155. Keyword + value + CTA.",
  "seoKeywords": "keyword1, keyword2, keyword3, keyword4, keyword5"
}`;

  // Attempt generation with validation + AI rewrite loop (max 2 retries)
  let attempt = 0;
  const maxAttempts = 3; // 1 initial + 2 retries
  let lastViolations: string[] = [];

  while (attempt < maxAttempts) {
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ];

    // Add strict rewrite instruction if retrying
    if (lastViolations.length > 0) {
      messages.push(
        { role: "assistant", content: "Previous attempt had SEO violations." },
        { role: "user", content: `Rewrite ONLY the seoTitle and seoDescription.

Rules:
- seoTitle must be ≤ 60 characters
- seoDescription must be 140–155 characters
- DO NOT cut words with ellipsis (...)
- DO NOT use "..." to shorten
- Keep it natural and SEO optimized
- Rewrite the full content with corrected fields

Violations to fix: ${lastViolations.join("; ")}

Return complete valid JSON again.` }
      );
    }

    const raw = await callAIService(messages, { maxTokens: 3000 });
    const parsed = parseAIJSON<ProductContentResult>(raw);

    // Check for SEO violations (no auto-trim)
    const violations = checkSEOViolations({
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
    });

    if (violations.length === 0) {
      return parsed; // Valid - return as-is
    }

    if (attempt < maxAttempts - 1) {
      // Try again with rewrite instruction
      lastViolations = violations;
      attempt++;
      continue;
    }

    // All retries exhausted - throw error
    throw new Error(`AI failed to generate valid SEO fields after ${maxAttempts} attempts. Violations: ${violations.join("; ")}`);
  }

  // Fallback (should never reach here)
  throw new Error("AI generation loop exited unexpectedly");
}

// ─── Blog Post Generator ───────────────────────────────────────────────────────

export async function generateBlogPost(
  ctx: { title: string; category?: string; tags?: string; excerpt?: string },
  adminSettings: AISetting | null = null
): Promise<BlogContentResult> {
  const systemPrompt = buildSystemPrompt(adminSettings, "blog");
  const keywords = adminSettings?.targetKeywords ?? "prefab buildings, modular construction";
  const rules = adminSettings?.contentRules ?? {};
  const minWords = rules.min_word_count ?? 800;

  const userPrompt = `Write a complete, SEO-optimized blog post for Saman Prefab.

BLOG POST DETAILS:
- Title hint: "${ctx.title || "Prefab Buildings Guide"}"
- Category: "${ctx.category || "General"}"
- Tags: "${ctx.tags || ""}"
- Excerpt hint: "${(ctx.excerpt ?? "").substring(0, 200)}"

SEO KEYWORDS TO NATURALLY INCLUDE: ${keywords}
MINIMUM LENGTH: ${minWords} words
STRUCTURE REQUIREMENTS: Use H2 and H3 headings, include introduction, body sections, FAQ, and conclusion with CTA.

Respond ONLY with valid JSON in exactly this shape:
{
  "title": "Final SEO-optimized H1 title (60–70 chars with primary keyword)",
  "excerpt": "2–3 sentence summary for post listing and meta (150–200 chars)",
  "content": "<p>Engaging introduction paragraph...</p>\\n<h2>First Main Section</h2>\\n<p>...</p>\\n<h3>Sub-section</h3>\\n<p>...</p>\\n<h2>Second Main Section</h2>\\n<p>...</p>\\n<ul><li>...</li></ul>\\n<h2>FAQ</h2>\\n<h3>Q: Common question?</h3>\\n<p>Answer...</p>\\n<h2>Conclusion</h2>\\n<p>...CTA...</p>",
  "headings": ["H2: First Section Title", "H2: Second Section Title", "H2: FAQ", "H2: Conclusion"],
  "faqs": [
    { "question": "Common question buyers ask?", "answer": "Detailed 2–3 sentence answer." },
    { "question": "Another important question?", "answer": "Detailed 2–3 sentence answer." },
    { "question": "Technical or pricing question?", "answer": "Detailed 2–3 sentence answer." },
    { "question": "Delivery or installation question?", "answer": "Detailed 2–3 sentence answer." },
    { "question": "Customization question?", "answer": "Detailed 2–3 sentence answer." }
  ],
  "metaTitle": "SEO meta title 50–60 chars STRICT",
  "metaDescription": "Meta description 140–155 chars STRICT. NEVER exceed 155. Include keyword + CTA.",
  "suggestedSlug": "seo-url-slug-here",
  "internalLinkSuggestions": ["/products/portable-cabin", "/products/security-cabin", "/contact"],
  "cta": "Get a free quote for your prefab project — call us at +91-XXXXXXXXXX or fill our online form."
}`;

  // Attempt generation with validation + AI rewrite loop (max 2 retries)
  let attempt = 0;
  const maxAttempts = 3; // 1 initial + 2 retries
  let lastViolations: string[] = [];
  let lastRawResponse: string | null = null;

  while (attempt < maxAttempts) {
    const messages: AIMessage[] = [{ role: "system", content: systemPrompt }];

    if (attempt === 0) {
      messages.push({ role: "user", content: userPrompt });
    } else {
      messages.push(
        { role: "user", content: userPrompt },
        { role: "assistant", content: lastRawResponse! },
        {
          role: "user",
          content: `Fix ONLY these fields:
- metaTitle
- metaDescription
- suggestedSlug

Violations:
${lastViolations.join("\n")}

Rules:
- metaTitle ≤ 60 characters
- metaDescription must be 140–155 characters
- suggestedSlug ≤ 60 characters
- DO NOT use ellipsis (...)
- Keep it natural and SEO optimized

IMPORTANT:
- Keep ALL other fields EXACTLY the same as previous response
- Do NOT modify content, title, FAQ, or structure
- Only update the specified SEO fields

Return complete valid JSON with ALL original fields preserved.` }
      );
    }

    const raw = await callAIService(messages, { maxTokens: 4000 });

    // Save raw response for context on retry
    lastRawResponse = raw;
    const parsed = parseAIJSON<BlogContentResult>(raw);

    // Null safety check
    if (!parsed.metaTitle || !parsed.metaDescription || !parsed.suggestedSlug) {
      lastViolations = ["Missing required SEO fields"];
      attempt++;
      continue;
    }

    // Check for SEO violations (no auto-trim)
    const violations = checkSEOViolations({
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      suggestedSlug: parsed.suggestedSlug,
    });

    if (violations.length === 0) {
      return parsed; // Valid - return as-is
    }

    if (attempt < maxAttempts - 1) {
      // Try again with rewrite instruction
      lastViolations = violations;
      attempt++;
      continue;
    }

    // All retries exhausted - throw error
    throw new Error(`AI failed to generate valid SEO fields after ${maxAttempts} attempts. Violations: ${violations.join("; ")}`);
  }

  // Fallback (should never reach here)
  throw new Error("AI generation loop exited unexpectedly");
}

// ─── SEO Optimizer ─────────────────────────────────────────────────────────────

export async function generateSEO(
  ctx: { name?: string; shortDescription?: string; content?: string; type: "product" | "blog" },
  adminSettings: AISetting | null = null
): Promise<SEOResult> {
  const systemPrompt = buildSystemPrompt(adminSettings, ctx.type);
  const keywords = adminSettings?.targetKeywords ?? "prefab, modular buildings";

  const subject = ctx.name || ctx.shortDescription?.substring(0, 100) || "Saman Prefab";
  const contentHint = (ctx.content ?? "").replace(/<[^>]+>/g, "").substring(0, 400);

  const userPrompt = `Generate search-optimized SEO metadata.

CONTENT DETAILS:
- Subject: "${subject}"
- Type: ${ctx.type}
- Content snippet: "${contentHint}"
- Target keywords: ${keywords}

REQUIREMENTS:
- Meta title must be exactly 50–60 characters STRICT
- Meta description must be exactly 140–155 characters STRICT (NEVER exceed 155)
- Include primary keyword naturally in both
- Meta description must end with a CTA

Respond ONLY with valid JSON:
{
  "seoTitle":       "Exactly 50–60 chars with primary keyword",
  "seoDescription": "Exactly 140–155 chars. NEVER exceed 155. Primary keyword + value proposition + call to action.",
  "seoKeywords":    "keyword1, keyword2, keyword3, keyword4, keyword5"
}`;

  // Attempt generation with validation + AI rewrite loop (max 2 retries)
  let attempt = 0;
  const maxAttempts = 3; // 1 initial + 2 retries
  let lastViolations: string[] = [];

  while (attempt < maxAttempts) {
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ];

    // Add strict rewrite instruction if retrying
    if (lastViolations.length > 0) {
      messages.push(
        { role: "assistant", content: "Previous attempt had SEO violations." },
        { role: "user", content: `Rewrite ONLY the seoTitle and seoDescription.

Rules:
- seoTitle must be ≤ 60 characters
- seoDescription must be 140–155 characters
- DO NOT cut words with ellipsis (...)
- DO NOT use "..." to shorten
- Keep it natural and SEO optimized
- Rewrite the full content with corrected fields

Violations to fix: ${lastViolations.join("; ")}

Return complete valid JSON again.` }
      );
    }

    const raw = await callAIService(messages, { maxTokens: 400 });
    const parsed = parseAIJSON<SEOResult>(raw);

    // Check for SEO violations (no auto-trim)
    const violations = checkSEOViolations({
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
    });

    if (violations.length === 0) {
      return parsed; // Valid - return as-is
    }

    if (attempt < maxAttempts - 1) {
      // Try again with rewrite instruction
      lastViolations = violations;
      attempt++;
      continue;
    }

    // All retries exhausted - throw error
    throw new Error(`AI failed to generate valid SEO fields after ${maxAttempts} attempts. Violations: ${violations.join("; ")}`);
  }

  // Fallback (should never reach here)
  throw new Error("AI generation loop exited unexpectedly");
}

// ─── FAQ Generator ─────────────────────────────────────────────────────────────

export async function generateFAQs(
  ctx: { name?: string; shortDescription?: string; type?: string },
  adminSettings: AISetting | null = null
): Promise<FAQResult> {
  const systemPrompt = buildSystemPrompt(adminSettings, "product");
  const subject = ctx.name ?? "Saman Prefab Product";

  const userPrompt = `Generate 6 FAQs optimized for Google FAQ rich results.

PRODUCT: "${subject}"
CONTEXT: "${(ctx.shortDescription ?? "").substring(0, 200)}"

Write questions real Indian buyers ask. Cover: sizing, pricing, installation, customization, delivery, warranty.
Each answer must be 2–3 specific, helpful sentences.

Respond ONLY with valid JSON:
{
  "faqs": [
    { "question": "...", "answer": "2–3 sentence specific answer" },
    { "question": "...", "answer": "2–3 sentence specific answer" },
    { "question": "...", "answer": "2–3 sentence specific answer" },
    { "question": "...", "answer": "2–3 sentence specific answer" },
    { "question": "...", "answer": "2–3 sentence specific answer" },
    { "question": "...", "answer": "2–3 sentence specific answer" }
  ]
}`;

  const raw = await callAIService([
    { role: "system", content: systemPrompt },
    { role: "user",   content: userPrompt },
  ], { maxTokens: 1200 });

  return parseAIJSON<FAQResult>(raw);
}

// ─── Rewrite / Expand / Shorten ────────────────────────────────────────────────

export async function rewriteText(
  text: string,
  mode: "rewrite" | "expand" | "seo_optimize",
  adminSettings: AISetting | null = null
): Promise<string> {
  const systemPrompt = buildSystemPrompt(adminSettings, "general");
  const keywords = adminSettings?.targetKeywords ?? "prefab, modular";

  const instructions: Record<typeof mode, string> = {
    rewrite:     "Rewrite to be more compelling, professional, and conversion-focused. Keep the same meaning but improve clarity and persuasion.",
    expand:      "Expand with more detail, features, benefits, and context. Use HTML (p, ul, strong) where appropriate. Aim for 2x the original length.",
    seo_optimize:`Rewrite this content to be fully SEO-optimized. Naturally incorporate these keywords: ${keywords}. Improve heading usage, add transition phrases, and ensure it reads naturally.`,
  };

  const userPrompt = `${instructions[mode]}

TEXT TO TRANSFORM:
"${text.substring(0, 2000)}"

Respond ONLY with valid JSON: { "result": "the transformed text" }`;

  const raw = await callAIService([
    { role: "system", content: systemPrompt },
    { role: "user",   content: userPrompt },
  ], { maxTokens: 2000 });

  const parsed = parseAIJSON<{ result?: string; improved?: string; expanded?: string }>(raw);
  return parsed.result ?? parsed.improved ?? parsed.expanded ?? "";
}

// ─── Generic dispatcher ────────────────────────────────────────────────────────

export async function callAIByType(
  type: string,
  context: Record<string, any>,
  adminSettings: AISetting | null = null
): Promise<Record<string, any>> {
  switch (type) {
    case "product_content":
      return generateProductContent(
        { name: context.name ?? "", shortDescription: context.shortDescription ?? "", category: context.category ?? "", specs: context.specs ?? "" },
        adminSettings
      );

    case "blog_post":
      return generateBlogPost(
        { title: context.title ?? "", category: context.category ?? "", tags: context.tags ?? "", excerpt: context.excerpt ?? "" },
        adminSettings
      );

    case "seo":
      return generateSEO(
        { name: context.name ?? context.title ?? "", shortDescription: context.shortDescription ?? context.excerpt ?? "", content: context.content ?? "", type: context.contentType ?? "product" },
        adminSettings
      );

    case "faq":
      return generateFAQs(
        { name: context.name ?? "", shortDescription: context.shortDescription ?? "" },
        adminSettings
      );

    case "rewrite":
    case "expand":
    case "seo_optimize": {
      const result = await rewriteText(context.text ?? "", type as any, adminSettings);
      return { result };
    }

    default:
      return generateProductContent(
        { name: context.name ?? "", shortDescription: context.shortDescription ?? "" },
        adminSettings
      );
  }
}
