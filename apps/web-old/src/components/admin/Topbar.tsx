'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutUser, getUserInitials, getRoleLabel } from '@/lib/auth';
import type { AdminUser } from '@/lib/auth';

interface TopbarProps {
  pageTitle: string;
  user: AdminUser | null;
}

export default function Topbar({ pageTitle, user }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-64 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold shrink-0">
              {getUserInitials(user.name)}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
