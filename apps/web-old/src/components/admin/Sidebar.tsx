'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Globe,
  Image,
  ArrowLeftRight,
  Settings,
  Building2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: <Package className="h-4 w-4" />,
  },
  {
    label: 'Quotes',
    href: '/admin/quotes',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'SEO Pages',
    href: '/admin/seo',
    icon: <Globe className="h-4 w-4" />,
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: <Image className="h-4 w-4" />,
  },
  {
    label: 'Redirects',
    href: '/admin/redirects',
    icon: <ArrowLeftRight className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Saman Prefab</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ].join(' ')}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
