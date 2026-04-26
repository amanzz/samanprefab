import { db, cities } from '@saman-prefab/db';
import { eq, ilike, and, count, asc, desc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { ListCitiesQuery } from './cities.schema';

export async function listCities(query: ListCitiesQuery) {
  const { page, limit, state, zone, search, isActive, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  const activeFilter = isActive === undefined ? true : isActive;
  conditions.push(eq(cities.isActive, activeFilter));
  if (state) conditions.push(eq(cities.stateSlug, state));
  if (zone) conditions.push(eq(cities.zone, zone));
  if (search) conditions.push(ilike(cities.name, `%${search}%`));

  const orderCol = cities[sortBy as keyof typeof cities] ?? cities.name;
  const orderFn = sortOrder === 'desc' ? desc : asc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(cities)
      .where(and(...conditions))
      .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(cities).where(and(...conditions)),
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

export async function getCityBySlug(slug: string) {
  const city = await db.query.cities.findFirst({ where: eq(cities.slug, slug) });
  if (!city) throw new AppError(404, 'City not found', 'NOT_FOUND');
  return city;
}
