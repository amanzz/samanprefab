export type AIContext = "global" | "product" | "blog";

export interface ContentRules {
  include_cta?:             boolean;
  include_benefits?:        boolean;
  include_specs?:           boolean;
  include_faqs?:            boolean;
  include_headings?:        boolean;
  include_faq?:             boolean;
  avoid_keyword_stuffing?:  boolean;
  suggest_internal_links?:  boolean;
  min_word_count?:          number;
}

export interface AISetting {
  id:             string;
  context:        AIContext;
  systemPrompt:   string;
  tone:           string;
  targetKeywords: string;
  language:       string;
  contentRules:   ContentRules;
  isActive:       boolean;
  createdAt:      string;
  updatedAt:      string;
}

export interface UpdateAISettingPayload {
  systemPrompt?:   string;
  tone?:           string;
  targetKeywords?: string;
  language?:       string;
  contentRules?:   ContentRules;
  isActive?:       boolean;
}

export interface AIGenerationLog {
  id:            string;
  context:       AIContext;
  actionType:    string;
  inputSummary:  string;
  outputPreview: string;
  durationMs:    number | null;
  tokensUsed:    number | null;
  success:       boolean;
  errorMessage:  string | null;
  createdAt:     string;
}

export interface AILogStats {
  total:          number;
  success:        number;
  failed:         number;
  byContext:      Record<string, number>;
  byAction:       Record<string, number>;
  avgDurationMs:  number;
}
