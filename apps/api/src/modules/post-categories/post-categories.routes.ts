import { Router } from 'express';
import * as controller from './post-categories.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { createPostCategorySchema, updatePostCategorySchema } from './post-categories.schema';

const router = Router();

router.get('/', controller.listPostCategories);
router.get('/:id', controller.getPostCategory);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createPostCategorySchema),
  controller.createPostCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updatePostCategorySchema),
  controller.updatePostCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deletePostCategory
);

export default router;
