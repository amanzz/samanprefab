import { Router } from 'express';
import { getGoogleMerchantFeed } from './feed.controller';

const router = Router();

router.get('/google-merchant', getGoogleMerchantFeed);

export default router;
