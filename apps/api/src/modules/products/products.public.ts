import type { Product as DbProduct, ProductCategory } from '@saman-prefab/db';

type ProductCategoryLite = Pick<ProductCategory, 'id' | 'name' | 'slug'>;

function sanitizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPrice(product: DbProduct) {
  const min = typeof product.priceMin === 'number' ? product.priceMin : null;
  const max = typeof product.priceMax === 'number' ? product.priceMax : null;

  if (min === null && max === null) {
    return null;
  }

  return {
    min,
    max,
    unit: product.priceUnit ?? null,
  };
}

function normalizeGallery(product: DbProduct): string[] {
  return Array.isArray(product.images)
    ? product.images.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function normalizeCategory(category: ProductCategory | null | undefined): ProductCategoryLite | null {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

export function serializePublicProduct(
  product: DbProduct,
  category?: ProductCategory | null
) {
  const gallery = normalizeGallery(product);
  const featuredImage = product.featuredImage || gallery[0] || null;
  const title = product.name;
  const faq = Array.isArray(product.faqs) ? product.faqs : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const applications = Array.isArray(product.applications) ? product.applications : [];
  const customButtons = Array.isArray(product.customButtons) ? product.customButtons : [];
  const specifications =
    product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)
      ? (product.specifications as Record<string, string>)
      : {};

  return {
    id: product.id,
    title,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? null,
    category: normalizeCategory(category),
    categoryId: product.categoryId ?? null,
    description: product.description ?? '',
    gallery,
    images: gallery,
    featuredImage,
    mainImage: featuredImage,
    price: buildPrice(product),
    priceText: product.priceText ?? null,
    priceDisplay: product.priceText ?? null,
    features,
    applications,
    specifications,
    attributes: Object.entries(specifications).map(([label, value], index) => ({
      id: `spec-${index}`,
      label,
      value,
    })),
    faq,
    faqs: faq,
    customButtons,
    showFeatures: product.showFeatures ?? true,
    showApplications: product.showApplications ?? true,
    showFaq: product.showFaq ?? true,
    sectionOrder: Array.isArray(product.sectionOrder) ? product.sectionOrder : ['features', 'applications', 'faq'],
    deliveryTime: product.deliveryTime ?? null,
    warranty: product.warranty ?? null,
    installationTime: product.installationTime ?? null,
    status: product.status,
    shortDescription: product.shortDescription ?? sanitizeText(product.description).slice(0, 180) ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
