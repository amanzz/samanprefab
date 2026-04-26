import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paths = [
      '/',
      '/products',
      '/blog',
      '/contact',
      '/get-quote',
    ];

    for (const p of paths) {
      revalidatePath(p, 'page');
    }
    revalidatePath('/', 'layout');

    const tags = ['products', 'categories', 'cities', 'blog', 'settings', 'seo'];
    for (const tag of tags) {
      revalidateTag(tag, 'default');
    }

    return NextResponse.json({
      success: true,
      data: {
        clearedPaths: paths,
        clearedTags: tags,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cache clear failed' },
      { status: 500 }
    );
  }
}
