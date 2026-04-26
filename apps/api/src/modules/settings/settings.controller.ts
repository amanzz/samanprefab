import type { Request, Response, NextFunction } from 'express';
import * as service from './settings.service';
import type { UpdateSettingInput, BulkUpdateSettingsInput } from './settings.schema';
import type { AuthenticatedRequest } from '../../types/index';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await service.getAllSettings();
    // No cache for settings in admin panel
    const isAuthenticated = !!(req as AuthenticatedRequest).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'private, max-age=60');
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getPublicSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await service.getPublicSettings();
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    res.json({ success: true, data: service.toMap(rows) });
  } catch (err) {
    next(err);
  }
}

export async function updateSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const row = await service.upsertSetting(req.body as UpdateSettingInput, userId);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { settings: inputs } = req.body as BulkUpdateSettingsInput;
    const rows = await service.bulkUpsertSettings(inputs, userId);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}
