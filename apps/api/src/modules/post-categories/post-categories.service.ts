import { db, postCategories } from '@saman-prefab/db';
import { eq, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { CreatePostCategoryInput, UpdatePostCategoryInput } from './post-categories.schema';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listPostCategories() {
  return db
    .select()
    .from(postCategories)
    .orderBy(asc(postCategories.sortOrder), asc(postCategories.name));
}

export async function getPostCategoryById(id: string) {
  const cat = await db.query.postCategories.findFirst({ where: eq(postCategories.id, id) });
  if (!cat) throw new AppError(404, 'Post category not found', 'NOT_FOUND');
  return cat;
}

export async function createPostCategory(input: CreatePostCategoryInput) {
  const slug = input.slug ?? slugify(input.name);

  const existing = await db.query.postCategories.findFirst({ where: eq(postCategories.slug, slug) });
  if (existing) throw new AppError(409, 'A category with this slug already exists', 'SLUG_CONFLICT');

  const [cat] = await db.insert(postCategories).values({ ...input, slug }).returning();
  return cat;
}

export async function updatePostCategory(id: string, input: UpdatePostCategoryInput) {
  await getPostCategoryById(id);
  const [updated] = await db
    .update(postCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(postCategories.id, id))
    .returning();
  return updated;
}

export async function deletePostCategory(id: string) {
  await getPostCategoryById(id);
  await db.delete(postCategories).where(eq(postCategories.id, id));
}
