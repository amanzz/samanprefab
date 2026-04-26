import type { Request, Response, NextFunction } from 'express';
import * as service from './post-tags.service';
import type { CreatePostTagInput, UpdatePostTagInput } from './post-tags.schema';

export async function listPostTags(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await service.listPostTags();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getPostTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await service.getPostTagById(req.params.id);
    res.json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
}

export async function createPostTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await service.createPostTag(req.body as CreatePostTagInput);
    res.status(201).json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
}

export async function updatePostTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await service.updatePostTag(req.params.id, req.body as UpdatePostTagInput);
    res.json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
}

export async function deletePostTag(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deletePostTag(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
