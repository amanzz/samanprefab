import { Router } from 'express';
import * as controller from './attributes.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createAttributeSchema,
  updateAttributeSchema,
  listAttributesQuerySchema,
  createAttributeValueSchema,
  updateAttributeValueSchema,
} from './attributes.schema';

const router = Router();

router.get('/', validateQuery(listAttributesQuerySchema), controller.listAttributes);
router.get('/:id', controller.getAttribute);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(createAttributeSchema),
  controller.createAttribute
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateAttributeSchema),
  controller.updateAttribute
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deleteAttribute
);

// ─── Attribute Values (nested) ────────────────────────────────────────────────
router.get('/:id/values', controller.listAttributeValues);

router.post(
  '/:id/values',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(createAttributeValueSchema),
  controller.createAttributeValue
);

router.patch(
  '/:id/values/:valueId',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateAttributeValueSchema),
  controller.updateAttributeValue
);

router.delete(
  '/:id/values/:valueId',
  authMiddleware,
  requireRole('super_admin'),
  controller.deleteAttributeValue
);

export default router;
