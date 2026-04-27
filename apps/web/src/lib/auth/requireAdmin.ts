import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) throw new Error('UNAUTHORIZED');

  try {
    // Verify token by calling backend API
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('UNAUTHORIZED');
    }

    const data = await response.json();
    return data.data;
  } catch {
    throw new Error('UNAUTHORIZED');
  }
}
