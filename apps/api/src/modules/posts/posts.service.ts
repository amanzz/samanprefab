import { db, posts, postCategoryMap, postTagMap, postCategories, postTags } from '@saman-prefab/db';
import { eq, and, ilike, desc, asc, inArray } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { CreatePostInput, UpdatePostInput, ListPostsQuery } from './posts.schema';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function attachRelations(postRows: typeof posts.$inferSelect[]) {
  if (postRows.length === 0) return postRows.map((p) => ({ ...p, categories: [], tags: [] }));

  const postIds = postRows.map((p) => p.id);

  const [catMaps, tagMaps] = await Promise.all([
    db
      .select({ postId: postCategoryMap.postId, category: postCategories })
      .from(postCategoryMap)
      .innerJoin(postCategories, eq(postCategoryMap.categoryId, postCategories.id))
      .where(inArray(postCategoryMap.postId, postIds)),
    db
      .select({ postId: postTagMap.postId, tag: postTags })
      .from(postTagMap)
      .innerJoin(postTags, eq(postTagMap.tagId, postTags.id))
      .where(inArray(postTagMap.postId, postIds)),
  ]);

  return postRows.map((p) => ({
    ...p,
    categories: catMaps.filter((m) => m.postId === p.id).map((m) => m.category),
    tags: tagMaps.filter((m) => m.postId === p.id).map((m) => m.tag),
  }));
}

async function syncRelations(postId: string, categoryIds: string[], tagIds: string[]) {
  await db.delete(postCategoryMap).where(eq(postCategoryMap.postId, postId));
  await db.delete(postTagMap).where(eq(postTagMap.postId, postId));

  if (categoryIds.length > 0) {
    await db.insert(postCategoryMap).values(
      categoryIds.map((categoryId) => ({ postId, categoryId }))
    );
  }
  if (tagIds.length > 0) {
    await db.insert(postTagMap).values(
      tagIds.map((tagId) => ({ postId, tagId }))
    );
  }
}

export async function listPosts(query: ListPostsQuery) {
  const { page, limit, status, search, categoryId, tagId, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(posts.status, status));
  if (search) conditions.push(ilike(posts.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let postRows = await db
    .select()
    .from(posts)
    .where(where)
    .orderBy(
      sortOrder === 'asc'
        ? asc(posts[sortBy as keyof typeof posts] as any)
        : desc(posts[sortBy as keyof typeof posts] as any)
    )
    .limit(limit + 50)
    .offset(offset);

  // Filter by category/tag after fetching (join-free approach for simplicity)
  if (categoryId) {
    const catPostIds = (
      await db.select({ postId: postCategoryMap.postId }).from(postCategoryMap).where(eq(postCategoryMap.categoryId, categoryId))
    ).map((r) => r.postId);
    postRows = postRows.filter((p) => catPostIds.includes(p.id));
  }
  if (tagId) {
    const tagPostIds = (
      await db.select({ postId: postTagMap.postId }).from(postTagMap).where(eq(postTagMap.tagId, tagId))
    ).map((r) => r.postId);
    postRows = postRows.filter((p) => tagPostIds.includes(p.id));
  }

  const total = postRows.length;
  const paginated = postRows.slice(0, limit);
  const items = await attachRelations(paginated);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getPostBySlug(slug: string) {
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post) throw new AppError(404, 'Post not found', 'NOT_FOUND');
  const [result] = await attachRelations([post]);
  return result;
}

export async function getPostById(id: string) {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) throw new AppError(404, 'Post not found', 'NOT_FOUND');
  const [result] = await attachRelations([post]);
  return result;
}

export async function createPost(input: CreatePostInput) {
  const slug = input.slug ?? slugify(input.title);

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (existing) throw new AppError(409, 'A post with this slug already exists', 'SLUG_CONFLICT');

  const { categoryIds, tagIds } = input;
  const publishedAt = input.status === 'published' ? new Date() : undefined;

  const [post] = await db
    .insert(posts)
    .values({
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt,
      featuredImage: input.featuredImage,
      status: input.status,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      canonicalUrl: input.canonicalUrl,
      ogTitle: input.ogTitle,
      ogDescription: input.ogDescription,
      ogImage: input.ogImage,
      twitterTitle: input.twitterTitle,
      twitterDescription: input.twitterDescription,
      twitterImage: input.twitterImage,
      publishedAt,
    })
    .returning();

  await syncRelations(post.id, categoryIds ?? [], tagIds ?? []);

  const [result] = await attachRelations([post]);
  return result;
}

export async function updatePost(id: string, input: UpdatePostInput) {
  const existing = await getPostById(id);

  const { categoryIds, tagIds, ...postData } = input;

  const publishedAt =
    postData.status === 'published' && existing.status !== 'published'
      ? new Date()
      : undefined;

  const updatePayload: Record<string, unknown> = { ...postData, updatedAt: new Date() };
  if (publishedAt) updatePayload.publishedAt = publishedAt;

  const [updated] = await db
    .update(posts)
    .set(updatePayload)
    .where(eq(posts.id, id))
    .returning();

  if (categoryIds !== undefined || tagIds !== undefined) {
    await syncRelations(id, categoryIds ?? [], tagIds ?? []);
  }

  const [result] = await attachRelations([updated]);
  return result;
}

export async function deletePost(id: string) {
  await getPostById(id);
  await db.delete(posts).where(eq(posts.id, id));
}
