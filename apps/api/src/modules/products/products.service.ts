import { db, products, productCategories, notifications, type ProductCategory } from '@saman-prefab/db';
import { eq, and, ilike, isNull, count, desc, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { CreateProductInput, UpdateProductInput, ListProductsQuery } from './products.schema';
import { serializePublicProduct } from './products.public';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listProducts(query: ListProductsQuery) {
  const { page, limit, category, categoryId, status, search, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [isNull(products.deletedAt)];
  if (status) conditions.push(eq(products.status, status));
  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));

  if (category) {
    const cat = await db.query.productCategories.findFirst({
      where: eq(productCategories.slug, category),
    });
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const orderCol = products[sortBy as keyof typeof products] ?? products.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  try {
    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(products).where(and(...conditions)),
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
  } catch (error) {
    console.error('[listProducts Error]', error);
    throw error;
  }
}

async function getCategoryMap(categoryIds: string[]) {
  if (categoryIds.length === 0) {
    return new Map<string, ProductCategory>();
  }

  const rows = await Promise.all(
    categoryIds.map((id) =>
      db.query.productCategories.findFirst({
        where: eq(productCategories.id, id),
      })
    )
  );

  return new Map(
    rows
      .filter((row): row is NonNullable<typeof row> => !!row)
      .map((row) => [row.id, row])
  );
}

export async function getProductBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), isNull(products.deletedAt)),
  });
  if (!product) throw new AppError(404, 'Product not found', 'NOT_FOUND');
  return product;
}

export async function listPublicProducts(query: ListProductsQuery) {
  const result = await listProducts(query);
  const categoryIds = Array.from(
    new Set(
      result.items
        .map((item) => item.categoryId)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    )
  );
  const categoryMap = await getCategoryMap(categoryIds);

  return {
    items: result.items.map((item) => serializePublicProduct(item, item.categoryId ? categoryMap.get(item.categoryId) : null)),
    meta: result.meta,
  };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await getProductBySlug(slug);
  if (product.status !== 'published') {
    throw new AppError(404, 'Product not found', 'NOT_FOUND');
  }
  const category = product.categoryId
    ? await db.query.productCategories.findFirst({
        where: eq(productCategories.id, product.categoryId),
      })
    : null;

  return serializePublicProduct(product, category);
}

export async function getProductById(id: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), isNull(products.deletedAt)),
  });
  if (!product) throw new AppError(404, 'Product not found', 'NOT_FOUND');
  return product;
}

export async function createProduct(input: CreateProductInput) {
  const slug = input.slug ?? slugify(input.name);

  const existing = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
  if (existing) throw new AppError(409, 'A product with this slug already exists', 'SLUG_CONFLICT');

  const [product] = await db
    .insert(products)
    .values({
      name: input.name,
      slug,
      sku: input.sku,
      categoryId: input.categoryId,
      shortDescription: input.shortDescription,
      description: input.description,
      specifications: input.specifications,
      features: input.features,
      applications: input.applications,
      customButtons: input.customButtons,
      images: input.images,
      featuredImage: input.featuredImage,
      documents: input.documents,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      priceText: input.priceText,
      priceUnit: input.priceUnit,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      canonicalUrl: input.canonicalUrl,
      status: input.status,
    })
    .returning();

  // Create notification for new product
  setImmediate(async () => {
    try {
      await db.insert(notifications).values({
        type: 'product',
        title: `New Product Created: ${product.name}`,
        description: `Product "${product.name}" has been created with status "${product.status}"`,
        data: {
          productId: product.id,
          productName: product.name,
          slug: product.slug,
          status: product.status,
        },
        actionUrl: `/admin/products`,
        read: false,
      });
    } catch (error) {
      console.error('Failed to create notification for product creation:', error);
    }
  });

  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);
  const [updated] = await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  // Create notification for product update
  setImmediate(async () => {
    try {
      await db.insert(notifications).values({
        type: 'product',
        title: `Product Updated: ${updated.name}`,
        description: `Product "${updated.name}" has been updated`,
        data: {
          productId: updated.id,
          productName: updated.name,
          slug: updated.slug,
          status: updated.status,
        },
        actionUrl: `/admin/products`,
        read: false,
      });
    } catch (error) {
      console.error('Failed to create notification for product update:', error);
    }
  });

  return updated;
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);
  await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id));

  // Create notification for product deletion
  setImmediate(async () => {
    try {
      await db.insert(notifications).values({
        type: 'product',
        title: `Product Deleted: ${product.name}`,
        description: `Product "${product.name}" has been deleted`,
        data: {
          productId: product.id,
          productName: product.name,
          slug: product.slug,
        },
        read: false,
      });
    } catch (error) {
      console.error('Failed to create notification for product deletion:', error);
    }
  });
}
