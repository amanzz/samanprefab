import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      settingsService.update(key, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['settings'],
        refetchType: 'all' 
      });
    },
  });
}
