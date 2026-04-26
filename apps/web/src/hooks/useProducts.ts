import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';

export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => productService.create(data),
    onSuccess: async () => {
      // Invalidate all product list queries (with any params)
      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'products',
        refetchType: 'all' 
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.update(id, data),

    // TASK 1: Optimistic update — list/detail shows new data INSTANTLY, no delay
    onMutate: async ({ id, data }) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ predicate: (q) => q.queryKey[0] === 'products' });
      await queryClient.cancelQueries({ queryKey: ['product', id] });

      // Snapshot current state for rollback on error
      const previousProduct = queryClient.getQueryData<Product>(['product', id]);
      const previousLists = queryClient.getQueriesData<any>({
        predicate: (q) => q.queryKey[0] === 'products',
      });

      // Normalize backend-format payload so it is cache-compatible.
      // mapFormToBackend outputs { images, specifications, metaTitle, ... }
      // but the cache holds { gallery, attributes, seoTitle, ... }.
      // We need both so the list page reads the right fields immediately.
      const STATUS_TO_BACKEND: Record<string, string> = {
        ACTIVE: 'published', DRAFT: 'draft', ARCHIVED: 'archived',
        active: 'published', draft: 'draft', archived: 'archived',
      };
      const normalized: Record<string, any> = {
        ...data,
        // images ↔ gallery
        gallery:    (data as any).images    ?? (data as any).gallery    ?? undefined,
        featuredImage:
          (data as any).featuredImage ??
          (data as any).mainImage ??
          ((data as any).images ?? (data as any).gallery ?? [])[0] ??
          undefined,
        mainImage:
          (data as any).featuredImage ??
          (data as any).mainImage ??
          ((data as any).images ?? (data as any).gallery ?? [])[0] ??
          undefined,
        priceText: (data as any).priceText ?? (data as any).priceDisplay ?? undefined,
        priceDisplay: (data as any).priceText ?? (data as any).priceDisplay ?? undefined,
        // seo field aliases
        seoTitle:       (data as any).metaTitle       ?? (data as any).seoTitle       ?? undefined,
        seoDescription: (data as any).metaDescription ?? (data as any).seoDescription ?? undefined,
        // remap frontend status enum → backend status string so optimistic UI shows correctly
        status: STATUS_TO_BACKEND[(data as any).status] ?? (data as any).status ?? undefined,
      };
      // Remove undefined keys so we don't accidentally overwrite existing values
      Object.keys(normalized).forEach((k) => normalized[k] === undefined && delete normalized[k]);

      // Optimistically update individual product cache
      queryClient.setQueryData(['product', id], (old: any) =>
        old ? { ...old, ...normalized } : old
      );

      // Optimistically update ALL list caches (any filter/search combination)
      queryClient.setQueriesData(
        { predicate: (q) => q.queryKey[0] === 'products' },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((p: any) =>
              p.id === id ? { ...p, ...normalized } : p
            ),
          };
        }
      );

      return { previousProduct, previousLists };
    },

    onError: (_err, { id }, context: any) => {
      // Roll back optimistic updates on error
      console.error('[useUpdateProduct] Error — rolling back optimistic update for id:', id);
      if (context?.previousProduct !== undefined) {
        queryClient.setQueryData(['product', id], context.previousProduct);
      }
      context?.previousLists?.forEach(([queryKey, data]: [any, any]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSuccess: (updatedProduct, variables) => {
      // Replace optimistic data with the confirmed API response
      queryClient.setQueryData(['product', variables.id], updatedProduct);
      queryClient.setQueriesData(
        { predicate: (q) => q.queryKey[0] === 'products' },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((p: any) =>
              p.id === variables.id ? updatedProduct : p
            ),
          };
        }
      );
    },

    onSettled: () => {
      // Refetch all queries (active + inactive) to guarantee server-side consistency
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === 'products',
        refetchType: 'all',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: async (_, id) => {
      // Invalidate all product list queries (with any params)
      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'products',
        refetchType: 'all' 
      });
      // Remove specific product from cache
      queryClient.removeQueries({ queryKey: ['product', id] });
    },
  });
}
