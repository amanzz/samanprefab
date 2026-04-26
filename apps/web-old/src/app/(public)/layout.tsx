import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Saman Prefab - Leading Prefabricated Structure Manufacturer in India',
  description: 'Buy high-quality prefabricated cabins, houses, site offices, and warehouses. Fast delivery across India. Get a free quote today!',
  keywords: ['prefab', 'portable cabin', 'prefabricated house', 'site office', 'warehouse', 'India'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Saman Prefab',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
