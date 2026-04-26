import { useQuery } from '@tanstack/react-query';
import { cityService } from '@/services/city.service';

export function useCities(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['cities', params],
    queryFn: () => cityService.getAll(params),
  });
}
