import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Saman Prefab | Quality Prefabricated Structures',
    template: '%s | Saman Prefab',
  },
  description:
    'High-quality prefabricated structures for residential, commercial, and industrial use. Get instant quotes for prefab buildings across India.',
  keywords: ['prefab structures', 'prefabricated buildings', 'portable cabins', 'modular buildings'],
  authors: [{ name: 'Saman Prefab' }],
  creator: 'Saman Prefab',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://samanprefab.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Saman Prefab',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
