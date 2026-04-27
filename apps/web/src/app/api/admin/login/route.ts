import { NextResponse } from 'next/server';

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

    // Backend handles token generation and sets cookies
    // Forward the response with all cookies from backend
    const response = NextResponse.json({ success: true, user });

    // Prevent caching of login responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Forward all cookies from backend including tokens
    const setCookieHeader = backendRes.headers.get('set-cookie');
    if (setCookieHeader) {
      // Split multiple cookies and append each
      const cookies = setCookieHeader.split(', ');
      cookies.forEach(cookie => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
