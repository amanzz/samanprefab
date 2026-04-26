import type { Request, Response, NextFunction } from 'express';
import * as variantsService from './product-variants.service';
import type { CreateVariantInput, UpdateVariantInput } from './products.schema';

export async function listVariants(req: Request, res: Response, next: NextFunction) {
  try {
    const variants = await variantsService.listVariants(req.params.id);
    res.json({ success: true, data: variants });
  } catch (err) {
    next(err);
  }
}

export async function createVariant(req: Request, res: Response, next: NextFunction) {
  try {
    const variant = await variantsService.createVariant(
      req.params.id,
      req.body as CreateVariantInput
    );
    res.status(201).json({ success: true, data: variant });
  } catch (err) {
    next(err);
  }
}

export async function updateVariant(req: Request, res: Response, next: NextFunction) {
  try {
    const variant = await variantsService.updateVariant(
      req.params.variantId,
      req.body as UpdateVariantInput
    );
    res.json({ success: true, data: variant });
  } catch (err) {
    next(err);
  }
}

export async function deleteVariant(req: Request, res: Response, next: NextFunction) {
  try {
    await variantsService.deleteVariant(req.params.variantId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
