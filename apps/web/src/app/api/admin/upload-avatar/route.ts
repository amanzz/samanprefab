import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
})();

export async function POST(request: Request) {
  let payload;
  try {
    payload = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const filename = `${payload.userId}-${timestamp}${ext}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user avatar in backend database
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('accessToken')?.value;

    if (token) {
      try {
        await fetch(`${API_URL}/auth/update-avatar`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: avatarUrl }),
        });
      } catch (err) {
        console.error('Failed to update avatar in backend:', err);
      }
    } else {
      console.warn('No token available for backend avatar update');
    }

    return NextResponse.json({ success: true, avatarUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
