import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import ToastProvider from '@/components/admin/ToastProvider';
import type { AdminUser } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

async function getUser(cookieHeader: string): Promise<AdminUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success: boolean; data?: AdminUser };
    return data.success ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}

interface AdminShellLayoutProps {
  children: React.ReactNode;
  params?: { pageTitle?: string };
}

export default async function AdminShellLayout({ children }: AdminShellLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/admin/login');
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const user = await getUser(cookieHeader);

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar pageTitle="Admin" user={user} />
        <main className="pl-64 pt-16 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
