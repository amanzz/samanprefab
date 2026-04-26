import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notFoundLogService } from '@/services/not-found-log.service';

export function useNotFoundLog(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['not-found-log', params],
    queryFn: () => notFoundLogService.getAll(params),
  });
}

export function useResolveNotFound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notFoundLogService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['not-found-log'] });
    },
  });
}
