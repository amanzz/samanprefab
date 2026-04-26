import { Router } from 'express';
import * as controller from './city-seo-pages.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createCitySeoPageSchema,
  updateCitySeoPageSchema,
  listCitySeoQuerySchema,
  bulkActivateSchema,
} from './city-seo-pages.schema';

const router = Router();

router.get('/', validateQuery(listCitySeoQuerySchema), controller.listCitySeoPages);
router.get('/:slug', controller.getCitySeoPage);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createCitySeoPageSchema),
  controller.createCitySeoPage
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updateCitySeoPageSchema),
  controller.updateCitySeoPage
);

router.post(
  '/bulk-activate',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(bulkActivateSchema),
  controller.bulkActivateCitySeoPages
);

export default router;
