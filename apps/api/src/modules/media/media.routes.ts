import { Router } from 'express';
import multer from 'multer';
import * as controller from './media.controller';
import { validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { listMediaQuerySchema } from './media.schema';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  controller.uploadMedia
);

router.get(
  '/',
  authMiddleware,
  validateQuery(listMediaQuerySchema),
  controller.listMedia
);

router.patch(
  '/:id',
  authMiddleware,
  controller.updateMediaMetadata
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  controller.deleteMedia
);

export default router;
