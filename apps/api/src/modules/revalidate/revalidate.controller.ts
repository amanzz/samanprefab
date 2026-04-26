import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/index';

interface RevalidateBody {
  paths?: string[];
  tags?: string[];
}

export async function triggerRevalidation(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['x-internal-token'];
    if (token !== config.internal.apiSecret) {
      throw new AppError(401, 'Invalid internal token', 'UNAUTHORIZED');
    }

    const { paths = [], tags = [] } = req.body as RevalidateBody;

    if (paths.length === 0 && tags.length === 0) {
      throw new AppError(400, 'At least one path or tag is required', 'VALIDATION_ERROR');
    }

    const nextUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const revalidationSecret = process.env.REVALIDATION_SECRET ?? '';

    if (!revalidationSecret) {
      console.warn('[Revalidation] REVALIDATION_SECRET not set — skipping Next.js ISR trigger');
      res.json({
        success: true,
        data: {
          revalidated: false,
          message: 'REVALIDATION_SECRET not configured',
          paths,
          tags,
        },
      });
      return;
    }

    const response = await fetch(`${nextUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths, tags, token: revalidationSecret }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      console.error('[Revalidation] Next.js ISR call failed:', response.status, data);
      throw new AppError(502, 'Next.js revalidation failed', 'INTERNAL_ERROR');
    }

    res.json({
      success: true,
      data: { revalidated: true, paths, tags, nextResponse: data },
    });
  } catch (err) {
    next(err);
  }
}
