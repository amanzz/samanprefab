import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '../../../../../../../lib/auth/jwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials against the backend — single source of truth
    let backendRes: Response;
    try {
      backendRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return NextResponse.json(
        { error: 'Cannot reach API server. Ensure backend is running.' },
        { status: 503 }
      );
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const backendData = await backendRes.json();
    const user = backendData?.data?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Issue Next.js tokens so middleware can guard /admin/* routes
    const payload = { userId: user.id, role: 'admin' as const };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const response = NextResponse.json({ success: true });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    });

    // Forward backend 'token' cookie so all /api/v1/* requests authenticate
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.append('Set-Cookie', setCookie);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
