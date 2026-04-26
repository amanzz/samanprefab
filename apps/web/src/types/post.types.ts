export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: Record<string, any>;
  excerpt?: string;
  featuredImage?: string;
  status: PostStatus;
  authorId?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  // Twitter
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  categories: PostCategory[];
  tags: PostTag[];
}

export interface CreatePostPayload {
  title: string;
  slug?: string;
  content?: Record<string, any>;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface PostListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostListResult {
  items: Post[];
  meta: PostListMeta;
}
