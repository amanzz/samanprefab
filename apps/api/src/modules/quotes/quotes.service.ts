import { db, quotes, quoteItems, products, productVariants, cities, notifications } from '@saman-prefab/db';
import { eq, and, ilike, gte, lte, count, desc, asc } from 'drizzle-orm';
import { sendQuoteConfirmation, sendNewQuoteAlert } from '../../lib/notifications/email.service';
import { generateQuotePdf } from '../../lib/pdf/quote-pdf.service';
import { AppError } from '../../middleware/error.middleware';
import type {
  SubmitQuoteInput,
  UpdateQuoteStatusInput,
  UpdateQuoteNotesInput,
  ListQuotesQuery,
} from './quotes.schema';

const ZONE_MULTIPLIERS: Record<string, number> = {
  north: 1.0,
  south: 1.05,
  east: 1.08,
  west: 1.02,
  central: 1.0,
  northeast: 1.15,
};

function generateRefId(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `SP-${dateStr}-${rand}`;
}

function estimateItemPrice(
  quantity: number,
  priceMin: number,
  priceMax: number,
  zone: string
): { min: number; max: number } {
  const multiplier = ZONE_MULTIPLIERS[zone] ?? 1.0;
  return {
    min: Math.round(priceMin * quantity * multiplier),
    max: Math.round(priceMax * quantity * multiplier),
  };
}

export async function submitQuote(input: SubmitQuoteInput) {
  const { items, location, specs, contact } = input;

  // Lookup city by ID or name
  let city = location.cityId 
    ? await db.query.cities.findFirst({ where: eq(cities.id, location.cityId) })
    : null;
  
  if (!city && location.cityName) {
    city = await db.query.cities.findFirst({ 
      where: ilike(cities.name, location.cityName),
    });
  }
  
  if (!city) {
    // Use a default city (Pune) if no match found
    city = await db.query.cities.findFirst({ where: eq(cities.slug, 'pune') });
  }
  
  if (!city) throw new AppError(404, 'City not found', 'NOT_FOUND');

  const resolvedItems: Array<{
    productId: string | null;
    productName: string;
    variantId: string | null;
    variantLabel: string | null;
    quantity: number;
    unit: string;
    estimatedPriceMin: number;
    estimatedPriceMax: number;
  }> = [];

  let totalMin = 0;
  let totalMax = 0;
  
  // Get zone from matched city or default
  const cityZone = city?.zone ?? 'central';
  // Use provided city name if available, otherwise from DB
  const finalCityName = location.cityName || city?.name || 'Unknown';
  // City ID can be null for unknown cities
  const finalCityId = city?.id || null;

  for (const item of items) {
    let product = item.productId 
      ? await db.query.products.findFirst({ where: eq(products.id, item.productId) })
      : null;
    
    // For public quotes with missing products, create placeholder data
    let productName = product?.name ?? 'General Inquiry';
    let priceMin = product?.priceMin ?? 0;
    let priceMax = product?.priceMax ?? 0;
    // Use null for unknown products (allows FK constraint to pass)
    let productId = product?.id ?? null;

    if (!product) {
      // Extract product name from specs.notes if available
      const notesMatch = specs.notes?.match(/^([^-]+)/);
      if (notesMatch) {
        productName = notesMatch[1].trim();
      }
      // Use default pricing for unknown products
      priceMin = 50000;
      priceMax = 150000;
    }

    let variantId: string | null = null;
    let variantLabel: string | null = null;

    if (item.variantId && product) {
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, item.variantId),
      });
      if (variant) {
        variantId = variant.id;
        variantLabel = variant.label;
        priceMin = variant.priceMin ?? priceMin;
        priceMax = variant.priceMax ?? priceMax;
      }
    }

    const estimate = estimateItemPrice(item.quantity, priceMin, priceMax, cityZone);
    totalMin += estimate.min;
    totalMax += estimate.max;

    resolvedItems.push({
      productId,
      productName,
      variantId,
      variantLabel,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPriceMin: estimate.min,
      estimatedPriceMax: estimate.max,
    });
  }

  const refId = generateRefId();

  const [quote] = await db
    .insert(quotes)
    .values({
      refId,
      cityId: finalCityId,
      cityName: finalCityName,
      pincode: location.pincode,
      deliveryAddress: location.deliveryAddress,
      timeline: specs.timeline,
      installationRequired: specs.installationRequired,
      notes: specs.notes,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      companyName: contact.companyName,
      contactType: contact.companyName ? 'company' : 'individual',
      estimatedTotalMin: totalMin,
      estimatedTotalMax: totalMax,
      sourceUrl: input.sourceUrl,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    })
    .returning();

  if (resolvedItems.length > 0) {
    await db.insert(quoteItems).values(
      resolvedItems.map((ri) => ({ ...ri, quoteId: quote.id }))
    );
  }

  setImmediate(async () => {
    sendQuoteConfirmation(quote, resolvedItems).catch(() => null);
    sendNewQuoteAlert(quote, resolvedItems).catch(() => null);
    generateQuotePdf(quote.refId).catch(() => null);

    // Create notification for new quote
    try {
      console.log('[Notification] Creating notification for quote:', quote.refId);
      await db.insert(notifications).values({
        type: 'quote',
        title: `New Quote Request: ${quote.refId}`,
        description: `${quote.contactName} from ${quote.cityName} requested a quote. Est. total: ₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
        data: {
          quoteId: quote.id,
          refId: quote.refId,
          contactName: quote.contactName,
          contactPhone: quote.contactPhone,
          cityName: quote.cityName,
          estimatedTotalMin: totalMin,
          estimatedTotalMax: totalMax,
        },
        actionUrl: `/admin/quotes`,
        read: false,
      });
      console.log('[Notification] Notification created successfully for quote:', quote.refId);
    } catch (error) {
      console.error('[Notification] Failed to create notification for quote:', error);
    }
  });

  return { quote, estimatedTotalMin: totalMin, estimatedTotalMax: totalMax };
}

export async function listQuotes(query: ListQuotesQuery) {
  const { page, limit, status, cityId, search, from, to, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(quotes.status, status));
  if (cityId) conditions.push(eq(quotes.cityId, cityId));
  if (search) conditions.push(ilike(quotes.contactName, `%${search}%`));
  if (from) conditions.push(gte(quotes.createdAt, new Date(from)));
  if (to) conditions.push(lte(quotes.createdAt, new Date(to)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderCol = quotes[sortBy as keyof typeof quotes] ?? quotes.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(whereClause)
      .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(quotes).where(whereClause),
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

export async function getQuoteById(id: string) {
  const quote = await db.query.quotes.findFirst({ where: eq(quotes.id, id) });
  if (!quote) throw new AppError(404, 'Quote not found', 'NOT_FOUND');
  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
  return { ...quote, items };
}

export async function getQuoteByRefId(refId: string) {
  const quote = await db.query.quotes.findFirst({ where: eq(quotes.refId, refId) });
  if (!quote) throw new AppError(404, 'Quote not found', 'NOT_FOUND');
  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quote.id));
  return { ...quote, items };
}

export async function updateQuoteStatus(id: string, input: UpdateQuoteStatusInput) {
  await getQuoteById(id);
  const [updated] = await db
    .update(quotes)
    .set({ status: input.status, adminNotes: input.adminNotes, updatedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning();
  return updated;
}

export async function updateQuoteNotes(id: string, input: UpdateQuoteNotesInput) {
  await getQuoteById(id);
  const [updated] = await db
    .update(quotes)
    .set({ adminNotes: input.adminNotes, updatedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning();
  return updated;
}
