import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';

    const apiRes = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
    });

    const data = await apiRes.json() as unknown;
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } },
      { status: 500 }
    );
  }
}
