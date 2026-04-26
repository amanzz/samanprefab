import { db, postTags } from '@saman-prefab/db';
import { eq, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { CreatePostTagInput, UpdatePostTagInput } from './post-tags.schema';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listPostTags() {
  return db.select().from(postTags).orderBy(asc(postTags.name));
}

export async function getPostTagById(id: string) {
  const tag = await db.query.postTags.findFirst({ where: eq(postTags.id, id) });
  if (!tag) throw new AppError(404, 'Post tag not found', 'NOT_FOUND');
  return tag;
}

export async function createPostTag(input: CreatePostTagInput) {
  const slug = input.slug ?? slugify(input.name);

  const existing = await db.query.postTags.findFirst({ where: eq(postTags.slug, slug) });
  if (existing) throw new AppError(409, 'A tag with this slug already exists', 'SLUG_CONFLICT');

  const [tag] = await db.insert(postTags).values({ ...input, slug }).returning();
  return tag;
}

export async function updatePostTag(id: string, input: UpdatePostTagInput) {
  await getPostTagById(id);
  const [updated] = await db
    .update(postTags)
    .set(input)
    .where(eq(postTags.id, id))
    .returning();
  return updated;
}

export async function deletePostTag(id: string) {
  await getPostTagById(id);
  await db.delete(postTags).where(eq(postTags.id, id));
}
