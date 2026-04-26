import { Router } from 'express';
import * as controller from './cities.controller';
import { validateQuery } from '../../middleware/validate.middleware';
import { listCitiesQuerySchema } from './cities.schema';

const router = Router();

router.get('/', validateQuery(listCitiesQuerySchema), controller.listCities);
router.get('/:slug', controller.getCity);

export default router;
