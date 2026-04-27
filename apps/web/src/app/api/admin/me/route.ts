import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { cookies } from 'next/headers';

const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
})();

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || cookieStore.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await backendRes.json();
    return NextResponse.json({ user: data.data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
