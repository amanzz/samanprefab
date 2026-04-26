'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const PRODUCT_LINKS = [
  { href: '/products/portable-cabin', label: 'Portable Cabins' },
  { href: '/products/prefab-house', label: 'Prefab Houses' },
  { href: '/products/site-office', label: 'Site Offices' },
  { href: '/products/labour-camp', label: 'Labour Camps' },
  { href: '/products/warehouse', label: 'Warehouses' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/sitemap.xml', label: 'Sitemap' },
];

const CITIES = [
  { href: '/prefab-portable-cabin-in-pune', label: 'Pune' },
  { href: '/prefab-portable-cabin-in-mumbai', label: 'Mumbai' },
  { href: '/prefab-portable-cabin-in-delhi', label: 'Delhi' },
  { href: '/prefab-portable-cabin-in-bangalore', label: 'Bangalore' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="font-bold text-white text-lg">Saman Prefab</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Leading manufacturer of prefabricated structures in India. 
              Quality, durability, and fast delivery guaranteed.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919876543210"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <a href="tel:+919876543210" className="text-sm text-gray-400 hover:text-white">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <a href="mailto:info@samanprefab.com" className="text-sm text-gray-400 hover:text-white">
                  info@samanprefab.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">
                  Pune, Maharashtra, India
                </span>
              </li>
            </ul>
            
            {/* Cities */}
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Popular Cities
              </h4>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <Link
                    key={city.href}
                    href={city.href}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {city.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Saman Prefab. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
