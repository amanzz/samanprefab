import { Router } from 'express';
import * as controller from './products.controller';
import * as variantsController from './product-variants.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  createVariantSchema,
  updateVariantSchema,
} from './products.schema';

const router = Router();

router.get('/', validateQuery(listProductsQuerySchema), controller.listProducts);
router.get('/public', validateQuery(listProductsQuerySchema), controller.listPublicProducts);
router.get('/public/:slug', controller.getPublicProduct);
router.get('/:slug', controller.getProduct);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createProductSchema),
  controller.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updateProductSchema),
  controller.updateProduct
);

router.delete('/:id', authMiddleware, requireRole('super_admin'), controller.deleteProduct);

router.get('/:id/variants', variantsController.listVariants);

router.post(
  '/:id/variants',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(createVariantSchema),
  variantsController.createVariant
);

router.put(
  '/variants/:variantId',
  authMiddleware,
  requireRole('super_admin', 'content_editor'),
  validateBody(updateVariantSchema),
  variantsController.updateVariant
);

router.delete(
  '/variants/:variantId',
  authMiddleware,
  requireRole('super_admin'),
  variantsController.deleteVariant
);

export default router;
