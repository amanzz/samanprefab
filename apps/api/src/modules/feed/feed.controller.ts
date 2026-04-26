import type { Request, Response, NextFunction } from 'express';
import { db, products, productCategories } from '@saman-prefab/db';
import { eq } from 'drizzle-orm';
import { config } from '../../config/index';

const SITE_URL = config.site.url;
const SITE_NAME = config.site.name;

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatINR(amount: number): string {
  return `${amount} INR`;
}

export async function getGoogleMerchantFeed(_req: Request, res: Response, next: NextFunction) {
  try {
    const publishedProducts = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        shortDescription: products.shortDescription,
        description: products.description,
        images: products.images,
        priceMin: products.priceMin,
        priceMax: products.priceMax,
        priceUnit: products.priceUnit,
        categoryId: products.categoryId,
        metaTitle: products.metaTitle,
        focusKeyword: products.focusKeyword,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.status, 'published'));

    const categories = await db.select().from(productCategories);
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const items = publishedProducts.map((p) => {
      const cat = p.categoryId ? catMap.get(p.categoryId) : null;
      const images = (p.images as string[]) ?? [];
      const primaryImage = images[0] ?? '';
      const productUrl = `${SITE_URL}/products/${p.slug}`;
      const description = xmlEscape(
        p.shortDescription ?? p.description?.slice(0, 500) ?? p.name
      );
      const title = xmlEscape(p.metaTitle ?? p.name);

      const priceValue = p.priceMin ?? 0;

      return `
    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${xmlEscape(productUrl)}</g:link>
      ${primaryImage ? `<g:image_link>${xmlEscape(primaryImage)}</g:image_link>` : ''}
      ${images[1] ? `<g:additional_image_link>${xmlEscape(images[1])}</g:additional_image_link>` : ''}
      <g:price>${formatINR(priceValue)}</g:price>
      ${p.priceMax && p.priceMax !== p.priceMin ? `<g:sale_price>${formatINR(p.priceMin ?? 0)}</g:sale_price>` : ''}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${xmlEscape(SITE_NAME)}</g:brand>
      ${cat ? `<g:product_type>${xmlEscape(cat.name)}</g:product_type>` : ''}
      ${cat ? `<g:google_product_category>Buildings &amp; Structures</g:google_product_category>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
    });

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${xmlEscape(SITE_URL)}</link>
    <description>Prefabricated structures — portable cabins, site offices, warehouses and more.</description>
    ${items.join('')}
  </channel>
</rss>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    });
    res.send(feed);
  } catch (err) {
    next(err);
  }
}
