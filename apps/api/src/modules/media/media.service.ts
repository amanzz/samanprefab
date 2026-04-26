import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { db, media } from '@saman-prefab/db';
import { eq, ilike, and, count, desc, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/index';
import type { ListMediaQuery } from './media.schema';

export interface MediaUrls {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

const SIZES = [
  { name: 'thumbnail', width: 300, quality: 80 },
  { name: 'medium', width: 800, quality: 82 },
  { name: 'large', width: 1600, quality: 85 },
] as const;

function buildMediaUrl(relPath: string): string {
  const base = config.cdn.baseUrl || '';
  return base ? `${base}/${relPath}` : `/uploads/${relPath}`;
}

function getUploadDir(): string {
  return path.resolve(config.upload.dir);
}

export async function processAndSaveImage(
  buffer: Buffer,
  originalName: string,
  altText: string | undefined,
  folder: string,
  uploadedBy: string | undefined
) {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = randomUUID();

  const folderPath = path.join('media', yyyy, mm);
  const absFolder = path.join(getUploadDir(), folderPath);
  await fs.mkdir(absFolder, { recursive: true });

  const image = sharp(buffer);
  const meta = await image.metadata();

  const urls: Record<string, string> = {};
  let totalSizeBytes = buffer.length;

  for (const size of SIZES) {
    const filename = `${uuid}-${size.width}w.webp`;
    const filePath = path.join(absFolder, filename);
    await image
      .clone()
      .resize({ width: size.width, withoutEnlargement: true })
      .webp({ quality: size.quality })
      .toFile(filePath);
    urls[size.name] = buildMediaUrl(`${folderPath}/${filename}`);
  }

  const origFilename = `${uuid}-orig.webp`;
  const origPath = path.join(absFolder, origFilename);
  await image.clone().webp({ quality: 90 }).toFile(origPath);
  urls.original = buildMediaUrl(`${folderPath}/${origFilename}`);

  const blurBuffer = await image
    .clone()
    .resize({ width: 10 })
    .webp({ quality: 50 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

  const slugifiedName = originalName
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const [record] = await db
    .insert(media)
    .values({
      filename: `${uuid}`,
      originalName: originalName,
      url: urls.large ?? urls.medium ?? urls.original,
      urls: urls,
      blurDataUrl,
      width: meta.width ?? null,
      height: meta.height ?? null,
      folder: `${folder}/${slugifiedName}`,
      mimeType: 'image/webp',
      sizeBytes: totalSizeBytes,
      altText: altText ?? slugifiedName.replace(/-/g, ' '),
      uploadedBy: uploadedBy ?? null,
    })
    .returning();

  return record;
}

export async function listMedia(query: ListMediaQuery) {
  const { page, limit, search, folder, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(media.filename, `%${search}%`));
  if (folder) conditions.push(ilike(media.folder, `${folder}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderCol = media[sortBy as keyof typeof media] ?? media.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(media)
      .where(whereClause)
      .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(media).where(whereClause),
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

export async function getMediaById(id: string) {
  const record = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!record) throw new AppError(404, 'Media not found', 'NOT_FOUND');
  return record;
}

export async function updateMediaMetadata(id: string, data: { altText?: string; title?: string; caption?: string }) {
  await getMediaById(id);
  const [updated] = await db
    .update(media)
    .set({ altText: data.altText, updatedAt: new Date() })
    .where(eq(media.id, id))
    .returning();
  return updated;
}

export async function deleteMedia(id: string) {
  const record = await getMediaById(id);
  const urls = record.urls as Record<string, string> | null;

  if (urls && Object.keys(urls).length > 0) {
    const uploadDir = getUploadDir();
    for (const url of Object.values(urls)) {
      const relPath = url.replace(/^\/uploads\//, '').replace(/^https?:\/\/[^/]+\//, '');
      const absPath = path.join(uploadDir, relPath);
      await fs.unlink(absPath).catch(() => null);
    }
  }

  await db.delete(media).where(eq(media.id, id));
  return { id };
}
