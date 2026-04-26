import { useQuery } from '@tanstack/react-query';
import { seoService } from '@/services/seo.service';

export function useSeoPage(citySlug: string, productSlug: string) {
  return useQuery({
    queryKey: ['seo-page', citySlug, productSlug],
    queryFn: () => seoService.getBySlug(citySlug, productSlug),
    enabled: !!citySlug && !!productSlug,
  });
}

export function useAllSeoPages(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['seo-pages', params],
    queryFn: () => seoService.getAll(params),
  });
}
