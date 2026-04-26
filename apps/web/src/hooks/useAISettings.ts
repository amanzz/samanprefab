import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiSettingsService } from "@/services/ai-settings.service";
import type { UpdateAISettingPayload, AIContext } from "@/types/ai-settings.types";

const KEYS = {
  all:     ["ai-settings"],
  context: (c: AIContext) => ["ai-settings", c],
  logs:    ["ai-settings", "logs"],
  stats:   ["ai-settings", "stats"],
};

export function useAllAISettings() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => aiSettingsService.getAll(),
  });
}

export function useAISetting(context: AIContext) {
  return useQuery({
    queryKey: KEYS.context(context),
    queryFn:  () => aiSettingsService.getByContext(context),
  });
}

export function useUpdateAISetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ context, data }: { context: AIContext; data: UpdateAISettingPayload }) =>
      aiSettingsService.upsert(context, data),
    onSuccess: (_, { context }) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.context(context) });
    },
  });
}

export function useAILogs() {
  return useQuery({
    queryKey: KEYS.logs,
    queryFn:  () => aiSettingsService.getLogs(),
  });
}

export function useAIStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn:  () => aiSettingsService.getStats(),
    refetchInterval: 30_000,
  });
}
