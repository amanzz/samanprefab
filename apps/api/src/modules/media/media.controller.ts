import type { Request, Response, NextFunction } from 'express';
import * as mediaService from './media.service';
import type { ListMediaQuery } from './media.schema';
import type { AuthenticatedRequest } from '../../types/index';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/index';

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'VALIDATION_ERROR');
    }

    const maxBytes = config.upload.maxFileSizeMb * 1024 * 1024;
    if (req.file.size > maxBytes) {
      throw new AppError(400, `File exceeds max size of ${config.upload.maxFileSizeMb}MB`, 'VALIDATION_ERROR');
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(req.file.mimetype)) {
      throw new AppError(400, 'Only JPEG, PNG, WebP, and GIF images are allowed', 'VALIDATION_ERROR');
    }

    const altText = typeof req.body.altText === 'string' ? req.body.altText : undefined;
    const folder = typeof req.body.folder === 'string' ? req.body.folder : 'general';
    const uploadedBy = (req as AuthenticatedRequest).user?.id;

    const record = await mediaService.processAndSaveImage(
      req.file.buffer,
      req.file.originalname,
      altText,
      folder,
      uploadedBy
    );

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await mediaService.listMedia(req.query as unknown as ListMediaQuery);
    res.set('Cache-Control', 'no-store, no-cache');
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function updateMediaMetadata(req: Request, res: Response, next: NextFunction) {
  try {
    const { altText, title, caption } = req.body;
    const updated = await mediaService.updateMediaMetadata(req.params.id, { altText, title, caption });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    await mediaService.deleteMedia(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
