"use client";

import React, { useState } from "react";
import {
  usePostCategories,
  useCreatePostCategory,
  useUpdatePostCategory,
  useDeletePostCategory,
} from "@/hooks/usePosts";
import { PostCategory } from "@/types/post.types";
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

// ─── Category Modal ───────────────────────────────────────────────────────────

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: PostCategory | null;
  allCategories: PostCategory[];
}

function CategoryModal({ isOpen, onClose, category, allCategories }: CategoryModalProps) {
  const isEditing = !!category;
  const createMutation = useCreatePostCategory();
  const updateMutation = useUpdatePostCategory();

  const [name, setName]               = useState(category?.name ?? "");
  const [slug, setSlug]               = useState((category?.slug) || slugify(category?.name ?? ""));
  const [description, setDesc]        = useState(category?.description ?? "");
  const [parentId, setParentId]       = useState(category?.parentId ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required");
    if (!slug.trim()) return setError("Slug is required");

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
      };
      if (isEditing && category) {
        await updateMutation.mutateAsync({ id: category.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      if (Array.isArray(err?.details) && err.details.length > 0) {
        const fields: Record<string, string> = {};
        err.details.forEach((d: { field: string; message: string }) => {
          if (d.field) fields[d.field] = d.message;
        });
        setFieldErrors(fields);
        setError("");
      } else {
        setError(err?.message || "Something went wrong");
      }
    }
  };

  if (!isOpen) return null;
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
        {isEditing ? "Edit Category" : "New Blog Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name <span className="text-error-500">*</span></Label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            placeholder="e.g. Construction Tips"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-error-500">{fieldErrors.name}</p>}
        </div>
        <div>
          <Label>URL Slug <span className="text-error-500">*</span></Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="construction-tips"
          />
          {fieldErrors.slug
            ? <p className="mt-1 text-xs text-error-500">{fieldErrors.slug}</p>
            : <p className="mt-0.5 text-[11px] text-gray-400">Lowercase letters, numbers, and hyphens only</p>
          }
        </div>
        <div>
          <Label>Parent Category</Label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Optional description"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-error-50 px-3 py-2 text-sm font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BlogCategoriesPage() {
  const { data: categories = [], isLoading, error } = usePostCategories();
  const deleteMutation = useDeletePostCategory();

  const [isModalOpen, setModalOpen]  = useState(false);
  const [editCat, setEditCat]        = useState<PostCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostCategory | null>(null);

  const openCreate = () => { setEditCat(null); setModalOpen(true); };
  const openEdit   = (c: PostCategory) => { setEditCat(c); setModalOpen(true); };
  const closeModal = () => { setEditCat(null); setModalOpen(false); };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const parentMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-pulse text-sm font-medium text-gray-400">Loading categories…</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <p className="font-medium text-error-500">Error loading categories.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Blog Categories</h2>
          <p className="text-sm text-gray-500">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate} size="sm">+ New Category</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Slug</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Parent</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Description</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {cat.parentId && <span className="text-gray-300 dark:text-gray-600">↳</span>}
                    <span className="font-semibold text-gray-800 dark:text-white/90">{cat.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {cat.slug}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cat.parentId ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {parentMap[cat.parentId] ?? "Unknown"}
                    </span>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>
                <td className="max-w-[200px] px-6 py-4 text-sm text-gray-400">
                  <p className="truncate">{cat.description || "—"}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEdit(cat)} className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">Edit</button>
                    <button onClick={() => setDeleteTarget(cat)} className="text-sm font-semibold text-error-500 hover:text-error-600 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="font-medium text-gray-400">No blog categories yet.</p>
                  <button onClick={openCreate} className="mt-2 text-sm text-brand-500 hover:underline">Create your first category</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal key={editCat?.id ?? 'new'} isOpen={isModalOpen} onClose={closeModal} category={editCat} allCategories={categories} />

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Category</h3>
          <p className="mb-6 text-sm text-gray-500">
            Delete <span className="font-semibold text-gray-700 dark:text-white">{deleteTarget?.name}</span>? Posts in this category will lose their assignment.
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
