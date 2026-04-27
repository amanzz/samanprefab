import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear all auth cookies — both systems
    response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    response.cookies.set('token', '', { maxAge: 0, path: '/' });

    // Also notify the backend to invalidate its session (best-effort)
    try {
      const apiUrl = (() => {
        const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
        return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
      })();
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore — cookie deletion above is sufficient
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
