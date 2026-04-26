import type { NextConfig } from "next";

function getApiUrl(): URL {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    return new URL(url);
  } catch {
    return new URL('http://localhost:4000/api/v1');
  }
}

const apiUrl = getApiUrl();
const apiHostname = apiUrl.hostname;
const apiProtocol = apiUrl.protocol.replace(':', '') as 'http' | 'https';
const apiPort = apiUrl.port || undefined;
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        port: apiPort,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      }
    ],
  },

  // Proxy /uploads/* through Next.js dev server → avoids CORS/mixed-origin issues
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_BASE}/uploads/:path*`,
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
