import type { Request, Response, NextFunction } from 'express';
import { db, products, productCategories, citySeoPages } from '@saman-prefab/db';
import { eq, and } from 'drizzle-orm';
import { config } from '../../config/index';

const SITE_URL = config.site.url;

function xmlEscape(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc: string, priority: string, changefreq: string, lastmod?: string): string {
  return `
  <url>
    <loc>${xmlEscape(`${SITE_URL}${loc}`)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

export async function getSitemap(_req: Request, res: Response, next: NextFunction) {
  try {
    const [allProducts, allCategories, publishedCityPages] = await Promise.all([
      db
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(and(eq(products.status, 'published'))),
      db
        .select({ slug: productCategories.slug, updatedAt: productCategories.updatedAt })
        .from(productCategories),
      db
        .select({ slug: citySeoPages.slug, updatedAt: citySeoPages.updatedAt })
        .from(citySeoPages)
        .where(eq(citySeoPages.status, 'published')),
    ]);

    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      urlEntry('/', '1.0', 'weekly', today),
      urlEntry('/products', '0.9', 'daily', today),
      urlEntry('/about', '0.6', 'monthly'),
      urlEntry('/contact', '0.6', 'monthly'),
      urlEntry('/blog', '0.7', 'weekly', today),
      urlEntry('/get-quote', '0.9', 'weekly'),
    ];

    const categoryUrls = allCategories.map((c) =>
      urlEntry(
        `/products/${c.slug}`,
        '0.8',
        'weekly',
        c.updatedAt ? c.updatedAt.toISOString().split('T')[0] : today
      )
    );

    const productUrls = allProducts.map((p) =>
      urlEntry(
        `/products/${p.slug}`,
        '0.8',
        'weekly',
        p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : today
      )
    );

    const cityPageUrls = publishedCityPages.map((cp) =>
      urlEntry(
        `/${cp.slug}`,
        '0.7',
        'monthly',
        cp.updatedAt ? cp.updatedAt.toISOString().split('T')[0] : today
      )
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoryUrls, ...productUrls, ...cityPageUrls].join('')}
</urlset>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    });
    res.send(xml);
  } catch (err) {
    next(err);
  }
}

export function getRobotsTxt(_req: Request, res: Response) {
  const robots = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /get-quote/confirm/
Disallow: /*?*

Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400',
  });
  res.send(robots);
}
