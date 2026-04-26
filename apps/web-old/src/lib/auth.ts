export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'sales_agent' | 'content_editor';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<AdminUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  const data = (await res.json()) as { success: boolean; data?: { user: AdminUser }; error?: { message: string } };

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message ?? 'Login failed');
  }

  return data.data!.user;
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { success: boolean; data?: AdminUser };
    return data.success ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getRoleLabel(role: AdminUser['role']): string {
  const labels: Record<AdminUser['role'], string> = {
    super_admin: 'Super Admin',
    sales_agent: 'Sales Agent',
    content_editor: 'Content Editor',
  };
  return labels[role] ?? role;
}
