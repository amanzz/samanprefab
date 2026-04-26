import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirectService } from '@/services/redirect.service';
import { Redirect } from '@/types/redirect.types';

export function useRedirects(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['redirects', params],
    queryFn: () => redirectService.getAll(params),
  });
}

export function useCreateRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Redirect>) => redirectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redirects'] });
    },
  });
}

export function useUpdateRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Redirect> }) =>
      redirectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redirects'] });
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redirectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redirects'] });
    },
  });
}
