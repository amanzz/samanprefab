import { Router } from 'express';
import { triggerRevalidation } from './revalidate.controller';

const router = Router();

router.post('/', triggerRevalidation);

export default router;
