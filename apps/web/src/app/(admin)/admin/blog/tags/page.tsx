"use client";

import React, { useState } from "react";
import {
  usePostTags,
  useCreatePostTag,
  useUpdatePostTag,
  useDeletePostTag,
} from "@/hooks/usePosts";
import { PostTag } from "@/types/post.types";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Tag Modal ─────────────────────────────────────────────────────────────────

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: PostTag | null;
}

function TagModal({ isOpen, onClose, tag }: TagModalProps) {
  const isEditing = !!tag;
  const createMutation = useCreatePostTag();
  const updateMutation = useUpdatePostTag();

  const [name, setName]               = useState(tag?.name ?? "");
  const [slug, setSlug]               = useState(tag?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError]             = useState("");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required");

    try {
      const payload = { name: name.trim(), slug: slug.trim() || slugify(name) };
      if (isEditing && tag) {
        await updateMutation.mutateAsync({ id: tag.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
        {isEditing ? "Edit Tag" : "New Tag"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tag Name <span className="text-error-500">*</span></Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. prefab-homes"
          />
        </div>
        <div>
          <Label>URL Slug</Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="auto-generated from name"
          />
          <p className="mt-0.5 text-[11px] text-gray-400">Lowercase letters, numbers, and hyphens only</p>
        </div>
        {error && (
          <p className="rounded-lg bg-error-50 px-3 py-2 text-sm font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Tag"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BlogTagsPage() {
  const { data: tags = [], isLoading, error } = usePostTags();
  const deleteMutation = useDeletePostTag();

  const [isModalOpen, setModalOpen]    = useState(false);
  const [editTag, setEditTag]          = useState<PostTag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostTag | null>(null);
  const [search, setSearch]            = useState("");

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditTag(null); setModalOpen(true); };
  const openEdit   = (t: PostTag) => { setEditTag(t); setModalOpen(true); };
  const closeModal = () => { setEditTag(null); setModalOpen(false); };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-pulse text-sm font-medium text-gray-400">Loading tags…</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <p className="font-medium text-error-500">Error loading tags.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Tags</h2>
          <p className="text-sm text-gray-500">{tags.length} tag{tags.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} size="sm">+ New Tag</Button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tags…"
        className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      {/* Tag cloud + table hybrid */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Tag Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Slug</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <span className="text-gray-400">#</span>{tag.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {tag.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(tag)} className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget(tag)} className="text-sm font-semibold text-error-500 hover:text-error-600 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          <svg className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
          </svg>
          <p className="font-medium">{search ? "No tags match your search" : "No tags yet"}</p>
          {!search && (
            <button onClick={openCreate} className="text-sm text-brand-500 hover:underline">Create your first tag</button>
          )}
        </div>
      )}

      <TagModal key={editTag?.id ?? 'new'} isOpen={isModalOpen} onClose={closeModal} tag={editTag} />

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Tag</h3>
          <p className="mb-6 text-sm text-gray-500">
            Delete <span className="font-semibold text-gray-700 dark:text-white">#{deleteTarget?.name}</span>? Posts using this tag will lose the tag assignment.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="flex-1 bg-error-600 hover:bg-error-700 border-none" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
