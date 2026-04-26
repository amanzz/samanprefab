import type { Request, Response, NextFunction } from 'express';
import * as attributesService from './attributes.service';
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
  ListAttributesQuery,
  CreateAttributeValueInput,
  UpdateAttributeValueInput,
} from './attributes.schema';

export async function listAttributes(req: Request, res: Response, next: NextFunction) {
  try {
    const attrs = await attributesService.listAttributes(req.query as unknown as ListAttributesQuery);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ success: true, data: attrs });
  } catch (err) {
    next(err);
  }
}

export async function getAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await attributesService.getAttributeById(req.params.id);
    res.json({ success: true, data: attr });
  } catch (err) {
    next(err);
  }
}

export async function createAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await attributesService.createAttribute(req.body as CreateAttributeInput);
    res.status(201).json({ success: true, data: attr });
  } catch (err) {
    next(err);
  }
}

export async function updateAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    const attr = await attributesService.updateAttribute(
      req.params.id,
      req.body as UpdateAttributeInput
    );
    res.json({ success: true, data: attr });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttribute(req: Request, res: Response, next: NextFunction) {
  try {
    await attributesService.deleteAttribute(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listAttributeValues(req: Request, res: Response, next: NextFunction) {
  try {
    const vals = await attributesService.listAttributeValues(req.params.id);
    res.json({ success: true, data: vals });
  } catch (err) {
    next(err);
  }
}

export async function createAttributeValue(req: Request, res: Response, next: NextFunction) {
  try {
    const val = await attributesService.createAttributeValue(
      req.params.id,
      req.body as CreateAttributeValueInput
    );
    res.status(201).json({ success: true, data: val });
  } catch (err) {
    next(err);
  }
}

export async function updateAttributeValue(req: Request, res: Response, next: NextFunction) {
  try {
    const val = await attributesService.updateAttributeValue(
      req.params.valueId,
      req.body as UpdateAttributeValueInput
    );
    res.json({ success: true, data: val });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttributeValue(req: Request, res: Response, next: NextFunction) {
  try {
    await attributesService.deleteAttributeValue(req.params.valueId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
