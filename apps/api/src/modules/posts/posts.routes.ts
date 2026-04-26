import { Router } from 'express';
import * as controller from './posts.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from './posts.schema';

const router = Router();

router.get('/', validateQuery(listPostsQuerySchema), controller.listPosts);
router.get('/:slug', controller.getPost);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createPostSchema),
  controller.createPost
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updatePostSchema),
  controller.updatePost
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deletePost
);

export default router;
