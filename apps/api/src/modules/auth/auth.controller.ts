import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import type { LoginInput, RegisterInput, ChangePasswordInput, UpdateAvatarInput } from './auth.schema';
import type { AuthenticatedRequest } from '../../types/index';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body as LoginInput);
    res
      .cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body as RegisterInput);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token').json({ success: true, message: 'Logged out' });
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Always fetch fresh data from DB — JWT payload is minted at login and
    // never refreshed, so stale fields like avatar would be returned otherwise.
    const freshUser = await authService.getById(req.user!.id);
    res.json({ success: true, data: freshUser });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user!.id, req.body as ChangePasswordInput);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.updateAvatar(req.user!.id, req.body as UpdateAvatarInput);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
