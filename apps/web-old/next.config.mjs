/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@saman-prefab/ui'],
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@saman-prefab/ui'],
  },
  async rewrites() {
    return [
      // Proxy all /api/* to Express, EXCEPT /api/auth/* (handled by Next.js Route Handlers)
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*', // Pass through to Next.js
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
