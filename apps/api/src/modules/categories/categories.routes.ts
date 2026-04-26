import { Router } from 'express';
import * as controller from './categories.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
} from './categories.schema';

const router = Router();

router.get('/', validateQuery(listCategoriesQuerySchema), controller.listCategories);
router.get('/:slug', controller.getCategory);

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(createCategorySchema),
  controller.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateCategorySchema),
  controller.updateCategory
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateCategorySchema),
  controller.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  controller.deleteCategory
);

export default router;
