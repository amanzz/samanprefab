import type { Request, Response, NextFunction } from 'express';
import * as service from './post-categories.service';
import type { CreatePostCategoryInput, UpdatePostCategoryInput } from './post-categories.schema';

export async function listPostCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await service.listPostCategories();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getPostCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await service.getPostCategoryById(req.params.id);
    res.json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
}

export async function createPostCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await service.createPostCategory(req.body as CreatePostCategoryInput);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
}

export async function updatePostCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await service.updatePostCategory(req.params.id, req.body as UpdatePostCategoryInput);
    res.json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
}

export async function deletePostCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deletePostCategory(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
