import { customFetch } from "@/lib/fetch";
import { API_CONFIG } from "@/lib/api";
import type { AISetting, UpdateAISettingPayload, AIGenerationLog, AILogStats, AIContext } from "@/types/ai-settings.types";

const BASE = API_CONFIG.endpoints.aiSettings;

export const aiSettingsService = {
  getAll: (): Promise<AISetting[]> =>
    customFetch<AISetting[]>(`${BASE}`),

  getByContext: (context: AIContext): Promise<AISetting | null> =>
    customFetch<AISetting | null>(`${BASE}/${context}`),

  upsert: (context: AIContext, data: UpdateAISettingPayload): Promise<AISetting> =>
    customFetch<AISetting>(`${BASE}/${context}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getLogs: (): Promise<AIGenerationLog[]> =>
    customFetch<AIGenerationLog[]>(`${BASE}/logs`),

  getStats: (): Promise<AILogStats> =>
    customFetch<AILogStats>(`${BASE}/stats`),
};
