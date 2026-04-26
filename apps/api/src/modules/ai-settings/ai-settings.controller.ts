import type { Request, Response, NextFunction } from 'express';
import * as service from './ai-settings.service';
import type { UpsertAISettingInput, CreateLogInput } from './ai-settings.schema';

export async function getAllSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await service.getAllAISettings();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function getSettingByContext(req: Request, res: Response, next: NextFunction) {
  try {
    const context = req.params.context as 'global' | 'product' | 'blog';
    const setting = await service.getAISettingByContext(context);
    res.json({ success: true, data: setting ?? null });
  } catch (err) { next(err); }
}

export async function upsertSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const context = req.params.context as 'global' | 'product' | 'blog';
    const updated = await service.upsertAISetting(context, req.body as UpsertAISettingInput);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await service.createLog(req.body as CreateLogInput);
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
}

export async function getLogs(_req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await service.getGenerationLogs(100);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await service.getLogStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}
