import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, postCategoryService, postTagService } from '@/services/post.service';
import type { CreatePostPayload, Post, PostCategory, PostTag } from '@/types/post.types';

const POSTS_KEY = 'posts';
const POST_CATEGORIES_KEY = 'post-categories';
const POST_TAGS_KEY = 'post-tags';

const invalidatePosts = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: [POSTS_KEY] });
};

// ─── Posts ─────────────────────────────────────────────────────────────────────

export function usePosts(params?: Record<string, any>) {
  return useQuery({
    queryKey: [POSTS_KEY, params],
    queryFn: () => postService.getAll(params),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: [POSTS_KEY, id],
    queryFn: () => postService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostPayload) => postService.create(data),
    onSuccess: () => {
      invalidatePosts(qc);
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostPayload> }) =>
      postService.update(id, data),
    onSuccess: (updated) => {
      invalidatePosts(qc);
      qc.invalidateQueries({ queryKey: [POSTS_KEY, updated.id] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.delete(id),
    onSuccess: () => {
      invalidatePosts(qc);
    },
  });
}

// ─── Post Categories ────────────────────────────────────────────────────────────

export function usePostCategories() {
  return useQuery({
    queryKey: [POST_CATEGORIES_KEY],
    queryFn: () => postCategoryService.getAll(),
  });
}

export function useCreatePostCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string; parentId?: string; sortOrder?: number }) =>
      postCategoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_CATEGORIES_KEY] });
    },
  });
}

export function useUpdatePostCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; slug: string; description: string; parentId: string; sortOrder: number }> }) =>
      postCategoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_CATEGORIES_KEY] });
    },
  });
}

export function useDeletePostCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postCategoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_CATEGORIES_KEY] });
    },
  });
}

// ─── Post Tags ─────────────────────────────────────────────────────────────────

export function usePostTags() {
  return useQuery({
    queryKey: [POST_TAGS_KEY],
    queryFn: () => postTagService.getAll(),
  });
}

export function useCreatePostTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug?: string }) => postTagService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_TAGS_KEY] });
    },
  });
}

export function useUpdatePostTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; slug: string }> }) =>
      postTagService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_TAGS_KEY] });
    },
  });
}

export function useDeletePostTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postTagService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POST_TAGS_KEY] });
    },
  });
}
