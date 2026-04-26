import { Router } from 'express';
import * as controller from './redirects.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createRedirectSchema,
  updateRedirectSchema,
  listRedirectsQuerySchema,
} from './redirects.schema';

const router = Router();

router.get(
  '/check',
  controller.checkRedirect
);

router.get(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateQuery(listRedirectsQuerySchema),
  controller.listRedirects
);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(createRedirectSchema),
  controller.createRedirect
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateRedirectSchema),
  controller.updateRedirect
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deleteRedirect
);

export default router;
