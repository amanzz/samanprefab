"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { Post, PostStatus } from "@/types/post.types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { API_CONFIG } from "@/lib/api";

const STATUS_BADGE: Record<PostStatus, string> = {
  [PostStatus.PUBLISHED]: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
  [PostStatus.DRAFT]:     "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AllPostsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const { data, isLoading, error } = usePosts({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const deleteMutation = useDeletePost();

  const posts = data?.items ?? [];
  const meta  = data?.meta;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">All Posts</h2>
          <p className="text-sm text-gray-500">
            {meta ? `${meta.total} post${meta.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <Link href="/admin/blog/posts/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search posts…"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as PostStatus | ""); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value={PostStatus.PUBLISHED}>Published</option>
          <option value={PostStatus.DRAFT}>Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="animate-pulse text-sm font-medium text-gray-400">Loading posts…</div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm font-medium text-error-500">
            Error loading posts. Check API connection.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Title</th>
                <th className="hidden px-6 py-4 text-sm font-semibold text-gray-500 sm:table-cell">Categories</th>
                <th className="hidden px-6 py-4 text-sm font-semibold text-gray-500 md:table-cell">Tags</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="hidden px-6 py-4 text-sm font-semibold text-gray-500 lg:table-cell">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.featuredImage && (
                        <img
                          src={API_CONFIG.assetUrl(post.featuredImage)}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-800 dark:text-white/90">{post.title}</p>
                        <p className="truncate font-mono text-[11px] text-gray-400">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(post.categories ?? []).map((c) => (
                        <span key={c.id} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                          {c.name}
                        </span>
                      ))}
                      {(post.categories ?? []).length === 0 && <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags ?? []).map((t) => (
                        <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          #{t.name}
                        </span>
                      ))}
                      {(post.tags ?? []).length === 0 && <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-gray-400 lg:table-cell">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/blog/posts/${post.id}/edit`}
                        className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="text-sm font-semibold text-error-500 hover:text-error-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/>
                      </svg>
                      <p className="font-medium">No posts yet</p>
                      <Link href="/admin/blog/posts/new">
                        <Button size="sm">Write your first post</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Post</h3>
          <p className="mb-6 text-sm text-gray-500">
            Delete <span className="font-semibold text-gray-700 dark:text-white">{deleteTarget?.title}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              className="flex-1 bg-error-600 hover:bg-error-700 border-none"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
