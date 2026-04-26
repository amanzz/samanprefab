import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoService } from '@/services/seo.service';
import { CitySeoPage } from '@/types/seo.types';

export function useSeoPages(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['seo-pages', params],
    queryFn: () => seoService.getAll(params),
  });
}

export function useCreateSeoPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CitySeoPage>) => seoService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'seo-pages',
        refetchType: 'all' 
      });
    },
  });
}

export function useUpdateSeoPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CitySeoPage> }) =>
      seoService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'seo-pages',
        refetchType: 'all' 
      });
      queryClient.removeQueries({ queryKey: ['seo-page', variables.id] });
    },
  });
}
