"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm from "@/components/blog/PostForm";
import { usePost } from "@/hooks/usePosts";
import { Post } from "@/types/post.types";
import Link from "next/link";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center p-6">
        <div className="animate-pulse text-sm font-medium text-gray-400">Loading post…</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center">
        <p className="font-medium text-error-500">Post not found or failed to load.</p>
        <Link href="/admin/blog/posts" className="mt-2 inline-block text-sm text-brand-500 hover:underline">
          ← Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/blog/posts" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
              ← All Posts
            </Link>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">Edit Post</h2>
        </div>
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors dark:border-gray-700 dark:text-gray-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View Post
        </a>
      </div>

      <PostForm
        initialData={post}
        onSuccess={(_updated: Post) => {
          router.refresh();
        }}
        onCancel={() => router.push("/admin/blog/posts")}
      />
    </div>
  );
}
