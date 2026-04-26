import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, type Category } from '@/services/category.service';

const CATEGORIES_KEY = 'categories';

export function useCategories(params?: Record<string, any>) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, params],
    queryFn: () => categoryService.getAll(params),
    staleTime: 0,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; parentId?: string }) =>
      categoryService.create(data),

    onMutate: async (newCat) => {
      await qc.cancelQueries({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });
      const snapshots = qc.getQueriesData<any>({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });

      const optimistic: Category = {
        id: `optimistic-${Date.now()}`,
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description ?? null,
        parentId: newCat.parentId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qc.setQueriesData(
        { predicate: (q) => q.queryKey[0] === CATEGORIES_KEY },
        (old: any) => {
          if (!old?.items) return old;
          return { ...old, items: [...old.items, optimistic] };
        }
      );

      return { snapshots };
    },

    onError: (_err, _vars, context: any) => {
      context?.snapshots?.forEach(([key, data]: [any, any]) => qc.setQueryData(key, data));
    },

    onSuccess: (created) => {
      qc.setQueriesData(
        { predicate: (q) => q.queryKey[0] === CATEGORIES_KEY },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((c: Category) =>
              c.id.startsWith('optimistic-') ? created : c
            ),
          };
        }
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY], refetchType: 'all' } as any);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryService.update(id, data),

    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });
      const snapshots = qc.getQueriesData<any>({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });

      qc.setQueriesData(
        { predicate: (q) => q.queryKey[0] === CATEGORIES_KEY },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((c: Category) =>
              c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
            ),
          };
        }
      );

      return { snapshots };
    },

    onError: (_err, _vars, context: any) => {
      context?.snapshots?.forEach(([key, data]: [any, any]) => qc.setQueryData(key, data));
    },

    onSuccess: (updated, { id }) => {
      qc.setQueriesData(
        { predicate: (q) => q.queryKey[0] === CATEGORIES_KEY },
        (old: any) => {
          if (!old?.items) return old;
          return { ...old, items: old.items.map((c: Category) => (c.id === id ? updated : c)) };
        }
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY], refetchType: 'all' } as any);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });
      const snapshots = qc.getQueriesData<any>({ predicate: (q) => q.queryKey[0] === CATEGORIES_KEY });

      qc.setQueriesData(
        { predicate: (q) => q.queryKey[0] === CATEGORIES_KEY },
        (old: any) => {
          if (!old?.items) return old;
          return { ...old, items: old.items.filter((c: Category) => c.id !== id) };
        }
      );

      return { snapshots };
    },

    onError: (_err, _vars, context: any) => {
      context?.snapshots?.forEach(([key, data]: [any, any]) => qc.setQueryData(key, data));
    },

    onSettled: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY], refetchType: 'all' } as any),
  });
}
