import { z } from 'zod';

const slugPattern = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

// Map frontend status to backend status
const statusSchema = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const lower = val.toLowerCase();
  if (lower === 'active') return 'published';
  return lower;
}, z.enum(['draft', 'published', 'archived']));

export const createProductSchema = z
  .object({
    name: z.string().min(3).max(200),
    slug: slugPattern.optional(),
    sku: z.string().max(100).optional(),
    categoryId: z.string().uuid(),
    shortDescription: z.string().min(20).max(200),
    description: z.string().min(50),
    specifications: z.record(z.string(), z.string()).optional().default({}),
    features: z
      .array(z.object({
        title: z.string().min(1),
        description: z.string().optional().default(''),
        icon: z.preprocess(
          (v) => (typeof v === 'string' ? (v ? { type: 'icon', value: v } : undefined) : v),
          z.object({ type: z.enum(['icon', 'image']), value: z.string() }).optional()
        ),
      }))
      .optional()
      .default([]),
    applications: z
      .array(z.object({ title: z.string().min(1), description: z.string().optional().default(''), image: z.string().optional().default('') }))
      .optional()
      .default([]),
    customButtons: z
      .array(z.object({
        label: z.string().min(1),
        url: z.string().min(1),
        type: z.enum(['link', 'file', 'whatsapp']).default('link'),
        style: z.enum(['primary', 'secondary']).default('primary'),
      }))
      .optional()
      .default([]),
    images: z.array(z.string().min(1)).min(1, 'At least one image is required').max(20),
    featuredImage: z.string().max(500).optional(),
    documents: z
      .array(z.object({ label: z.string(), url: z.string().min(1) }))
      .optional()
      .default([]),
    priceMin: z.number().int().positive(),
    priceMax: z.number().int().positive(),
    priceText: z.string().max(120).optional(),
    priceUnit: z.enum(['unit', 'sqft', 'piece']),
    metaTitle: z.string().max(65).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword: z.string().max(100).optional(),
    canonicalUrl: z.string().url().optional(),
    leadTimeDays: z
      .object({ min: z.number().int().positive(), max: z.number().int().positive() })
      .optional(),
    faqs: z
      .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
      .optional()
      .default([]),
    isFeatured: z.boolean().optional().default(false),
    showFeatures: z.boolean().optional().default(true),
    showApplications: z.boolean().optional().default(true),
    showFaq: z.boolean().optional().default(true),
    status: statusSchema.default('draft'),
    sectionOrder: z.array(z.string()).optional().default(['features', 'applications', 'faq']),
    deliveryTime: z.string().max(100).optional(),
    warranty: z.string().max(100).optional(),
    installationTime: z.string().max(100).optional(),
  })
  .refine((d) => d.priceMax >= d.priceMin, {
    message: 'priceMax must be ≥ priceMin',
    path: ['priceMax'],
  });


export const updateProductSchema = createProductSchema.innerType().partial().refine(
  (d) => d.priceMax === undefined || d.priceMin === undefined || d.priceMax >= d.priceMin,
  { message: 'priceMax must be ≥ priceMin', path: ['priceMax'] }
);

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    const lower = val.toLowerCase();
    if (lower === 'active') return 'published';
    return lower;
  }, z.enum(['draft', 'published', 'archived']).optional()),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'priceMin', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createVariantSchema = z.object({
  label: z.string().min(2).max(255),
  size: z.string().max(100).optional(),
  material: z.string().max(100).optional(),
  finish: z.string().max(100).optional(),
  priceMin: z.number().int().positive().optional(),
  priceMax: z.number().int().positive().optional(),
  unit: z.enum(['unit', 'sqft', 'piece']).default('unit'),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
