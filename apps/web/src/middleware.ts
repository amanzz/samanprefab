import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Exclude files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if path starts with /admin and is not /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      const accessToken = request.cookies.get('accessToken')?.value;

      // If access token exists, allow access
      if (accessToken) {
        return NextResponse.next();
      }

      // No token, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    } catch (error) {
      // Any error, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other paths
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
