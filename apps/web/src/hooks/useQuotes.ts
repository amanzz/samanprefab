import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteService } from '@/services/quote.service';
import { QuoteStatus } from '@/types/quote.types';

export function useQuotes(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => quoteService.getAll(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => quoteService.getById(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => quoteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      quoteService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuoteNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes: string }) =>
      quoteService.updateNotes(id, adminNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] });
    },
  });
}
