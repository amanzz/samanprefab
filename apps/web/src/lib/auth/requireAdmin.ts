import { cookies } from 'next/headers';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) throw new Error('UNAUTHORIZED');

  try {
    return verifyAccessToken(token);
  } catch {
    throw new Error('UNAUTHORIZED');
  }
}
