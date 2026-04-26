import { Router } from 'express';
import * as controller from './post-tags.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { createPostTagSchema, updatePostTagSchema } from './post-tags.schema';

const router = Router();

router.get('/', controller.listPostTags);
router.get('/:id', controller.getPostTag);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createPostTagSchema),
  controller.createPostTag
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updatePostTagSchema),
  controller.updatePostTag
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deletePostTag
);

export default router;
