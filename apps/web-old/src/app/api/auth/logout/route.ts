import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';

    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { cookie: cookieHeader },
    });
  } catch {
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
