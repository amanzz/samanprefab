import type { Request, Response, NextFunction } from 'express';
import * as postsService from './posts.service';
import type { ListPostsQuery, CreatePostInput, UpdatePostInput } from './posts.schema';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await postsService.listPosts(req.query as unknown as ListPostsQuery);
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const param = req.params.slug;
    const post = UUID_RE.test(param)
      ? await postsService.getPostById(param)
      : await postsService.getPostBySlug(param);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.createPost(req.body as CreatePostInput);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.updatePost(req.params.id, req.body as UpdatePostInput);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await postsService.deletePost(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
