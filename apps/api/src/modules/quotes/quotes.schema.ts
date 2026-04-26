import { z } from 'zod';

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

const indianPincode = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode');

export const submitQuoteSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.union([z.string().uuid(), z.null(), z.undefined()]).optional(),
        variantId: z.union([z.string().uuid(), z.null(), z.undefined()]).optional(),
        quantity: z.number().int().min(1).max(500),
        unit: z.enum(['unit', 'sqft', 'piece']),
      })
    )
    .min(1, 'At least one product is required')
    .max(10),

  location: z.object({
    cityId: z.string().uuid().optional(),
    cityName: z.string().min(1).max(100).optional(),
    pincode: indianPincode.optional(),
    deliveryAddress: z.string().max(500).optional(),
  }).refine((data) => data.cityId || data.cityName, {
    message: 'Either cityId or cityName is required',
  }),

  specs: z.object({
    timeline: z.enum(['asap', 'one_month', 'three_months', 'flexible']),
    installationRequired: z.boolean(),
    notes: z.string().max(500).optional(),
  }),

  contact: z.object({
    name: z.string().min(2).max(100),
    phone: indianPhone,
    email: z.string().email(),
    companyName: z.string().max(200).optional(),
  }),

  sourceUrl: z.string().url().optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost', 'spam']),
  adminNotes: z.string().max(2000).optional(),
});

export const updateQuoteNotesSchema = z.object({
  adminNotes: z.string().max(2000),
});

export const listQuotesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost', 'spam']).optional(),
  cityId: z.string().uuid().optional(),
  search: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'estimatedTotalMax']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
export type UpdateQuoteNotesInput = z.infer<typeof updateQuoteNotesSchema>;
export type ListQuotesQuery = z.infer<typeof listQuotesQuerySchema>;
