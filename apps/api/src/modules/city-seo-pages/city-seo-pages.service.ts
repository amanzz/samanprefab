import { db, citySeoPages, cities, productCategories, products } from '@saman-prefab/db';
import { eq, and, ilike, count, desc, asc, min, max } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateCitySeoPageInput,
  UpdateCitySeoPageInput,
  ListCitySeoQuery,
  BulkActivateInput,
} from './city-seo-pages.schema';

export async function listCitySeoPages(query: ListCitySeoQuery) {
  const { page, limit, cityId, categoryId, status, search, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (cityId) conditions.push(eq(citySeoPages.cityId, cityId));
  if (categoryId) conditions.push(eq(citySeoPages.productCategoryId, categoryId));
  if (status) conditions.push(eq(citySeoPages.status, status));
  if (search) conditions.push(ilike(citySeoPages.slug, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderCol = citySeoPages[sortBy as keyof typeof citySeoPages] ?? citySeoPages.priority;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(citySeoPages)
      .where(whereClause)
      .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(citySeoPages).where(whereClause),
  ]);

  const totalNum = Number(total);
  return {
    items: rows,
    meta: {
      page,
      limit,
      total: totalNum,
      totalPages: Math.ceil(totalNum / limit),
      hasNext: page * limit < totalNum,
      hasPrev: page > 1,
    },
  };
}

export async function getCitySeoPageBySlug(slug: string) {
  const page = await db.query.citySeoPages.findFirst({
    where: eq(citySeoPages.slug, slug),
  });
  if (!page) throw new AppError(404, 'City SEO page not found', 'NOT_FOUND');

  const [city, category] = await Promise.all([
    db.query.cities.findFirst({ where: eq(cities.id, page.cityId) }),
    db.query.productCategories.findFirst({
      where: eq(productCategories.id, page.productCategoryId),
    }),
  ]);

  const priceAgg = await db
    .select({
      priceMin: min(products.priceMin),
      priceMax: max(products.priceMax),
    })
    .from(products)
    .where(
      and(eq(products.categoryId, page.productCategoryId), eq(products.status, 'published'))
    );

  const generatedMeta = buildGeneratedMeta(
    city?.name ?? '',
    city?.state ?? '',
    category?.name ?? '',
    page.slug
  );

  return {
    ...page,
    city,
    category,
    priceRange: priceAgg[0],
    meta: {
      title: page.metaTitle ?? generatedMeta.title,
      description: page.metaDescription ?? generatedMeta.description,
      h1: page.h1Override ?? generatedMeta.h1,
    },
  };
}

function buildGeneratedMeta(
  cityName: string,
  stateName: string,
  categoryName: string,
  _slug: string
) {
  return {
    title: `Prefab ${categoryName} in ${cityName}, ${stateName} | Saman Prefab`,
    description: `Buy prefab ${categoryName.toLowerCase()} in ${cityName}. Fast delivery, ISI-certified materials, competitive pricing. Get a free quote today.`,
    h1: `Prefab ${categoryName} in ${cityName}, ${stateName}`,
  };
}

export async function getCitySeoPageById(id: string) {
  const page = await db.query.citySeoPages.findFirst({ where: eq(citySeoPages.id, id) });
  if (!page) throw new AppError(404, 'City SEO page not found', 'NOT_FOUND');
  return page;
}

export async function createCitySeoPage(input: CreateCitySeoPageInput) {
  const existing = await db.query.citySeoPages.findFirst({
    where: eq(citySeoPages.slug, input.slug),
  });
  if (existing) throw new AppError(409, 'A page with this slug already exists', 'SLUG_CONFLICT');

  const [page] = await db.insert(citySeoPages).values({
    cityId: input.cityId,
    productCategoryId: input.productCategoryId,
    slug: input.slug,
    status: input.status ?? 'draft',
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    h1Override: input.h1Override,
    customBlocks: input.customBlocks,
    aiGeneratedContent: input.aiGeneratedContent,
    internalLinks: input.internalLinks,
    priority: input.priority ?? 50,
  }).returning();
  return page;
}

export async function updateCitySeoPage(id: string, input: UpdateCitySeoPageInput) {
  await getCitySeoPageById(id);
  const [updated] = await db
    .update(citySeoPages)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(citySeoPages.id, id))
    .returning();
  return updated;
}

export async function bulkActivateCitySeoPages(input: BulkActivateInput) {
  const created: string[] = [];
  const updated: string[] = [];

  for (const cityId of input.cityIds) {
    for (const categoryId of input.categoryIds) {
      const city = await db.query.cities.findFirst({ where: eq(cities.id, cityId) });
      const category = await db.query.productCategories.findFirst({
        where: eq(productCategories.id, categoryId),
      });
      if (!city || !category) continue;

      const slug = `prefab-${category.slug}-in-${city.slug}`;
      const existing = await db.query.citySeoPages.findFirst({
        where: eq(citySeoPages.slug, slug),
      });

      if (existing) {
        await db
          .update(citySeoPages)
          .set({ status: input.statusTarget, updatedAt: new Date() })
          .where(eq(citySeoPages.id, existing.id));
        updated.push(slug);
      } else {
        await db.insert(citySeoPages).values({
          cityId,
          productCategoryId: categoryId,
          slug,
          status: input.statusTarget,
          priority: 50,
        });
        created.push(slug);
      }
    }
  }

  return { created: created.length, updated: updated.length, slugs: [...created, ...updated] };
}
