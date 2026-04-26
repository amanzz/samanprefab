-- AI Content Engine: ai_settings + ai_generation_log

DO $$ BEGIN
  CREATE TYPE "ai_context" AS ENUM('global', 'product', 'blog');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ai_settings" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "context"         "ai_context" NOT NULL UNIQUE,
  "system_prompt"   text NOT NULL DEFAULT '',
  "tone"            varchar(100) DEFAULT 'professional',
  "target_keywords" text DEFAULT '',
  "language"        varchar(50) DEFAULT 'English',
  "content_rules"   jsonb DEFAULT '{}',
  "is_active"       boolean DEFAULT true NOT NULL,
  "created_at"      timestamp DEFAULT now() NOT NULL,
  "updated_at"      timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_generation_log" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "context"        "ai_context" NOT NULL,
  "action_type"    varchar(50) NOT NULL,
  "input_summary"  varchar(500) DEFAULT '',
  "output_preview" text DEFAULT '',
  "duration_ms"    integer,
  "tokens_used"    integer,
  "success"        boolean DEFAULT true NOT NULL,
  "error_message"  text,
  "created_at"     timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_generation_log_context_idx"  ON "ai_generation_log" ("context");
CREATE INDEX IF NOT EXISTS "ai_generation_log_created_idx"  ON "ai_generation_log" ("created_at");
CREATE INDEX IF NOT EXISTS "ai_generation_log_success_idx"  ON "ai_generation_log" ("success");

-- Seed default AI settings for all three contexts
INSERT INTO "ai_settings" ("context", "system_prompt", "tone", "target_keywords", "language", "content_rules")
VALUES
  (
    'global',
    'You are a professional content writer and SEO expert for Saman Prefab — a premium prefab building company based in India. Always write high-quality, conversion-focused content targeting Indian buyers and businesses. Prioritize clarity, professionalism, and SEO value.',
    'professional',
    'prefab, modular buildings, portable cabins, prefab houses India, Saman Prefab',
    'English',
    '{"include_cta": true, "include_benefits": true, "avoid_keyword_stuffing": true, "suggest_internal_links": true}'
  ),
  (
    'product',
    'Write compelling product content for Saman Prefab. Focus on features, benefits, use cases, and technical specifications. Always highlight quality, customization options, and fast delivery. Include a clear call-to-action. Target buyers searching for premium prefab structures.',
    'premium',
    'prefab cabin, modular cabin, portable office, prefab steel structure, industrial cabin',
    'English',
    '{"include_specs": true, "include_faqs": true, "include_cta": true, "include_benefits": true}'
  ),
  (
    'blog',
    'Write informative, SEO-optimized blog posts for Saman Prefab. Structure content with clear H2/H3 headings, include practical insights for buyers and contractors, add a FAQ section. Content must rank well in Google for Indian prefab-related searches. Naturally include target keywords.',
    'informative',
    'prefab buildings, modular construction, prefab homes India, container homes, portable structures',
    'English',
    '{"include_headings": true, "include_faq": true, "include_cta": true, "suggest_internal_links": true, "min_word_count": 800}'
  )
ON CONFLICT ("context") DO NOTHING;
