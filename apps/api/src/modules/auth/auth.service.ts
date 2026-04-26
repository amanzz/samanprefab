import { db, users } from '@saman-prefab/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';
import { AppError } from '../../middleware/error.middleware';
import type { LoginInput, RegisterInput, ChangePasswordInput, UpdateAvatarInput } from './auth.schema';

export async function login(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'Invalid credentials', 'UNAUTHORIZED');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid credentials', 'UNAUTHORIZED');
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, avatar: user.avatar },
    config.jwt.secret,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: config.jwt.expiresIn as any }
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
  };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!match) throw new AppError(401, 'Current password is incorrect', 'UNAUTHORIZED');

  const newHash = await bcrypt.hash(input.newPassword, 12);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));
}

export async function updateAvatar(userId: string, input: UpdateAvatarInput) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  await db.update(users).set({ avatar: input.avatar }).where(eq(users.id, userId));

  return { avatar: input.avatar };
}

export async function getById(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
}


export async function register(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  if (existing) throw new AppError(409, 'Email already in use', 'EMAIL_CONFLICT');

  const passwordHash = await bcrypt.hash(input.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role: input.role ?? 'sales_agent',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
    });

  return user;
}
