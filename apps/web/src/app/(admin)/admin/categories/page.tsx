"use client";

import React, { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { type Category } from "@/services/category.service";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

// ─── Slug helper ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Category Form Modal ───────────────────────────────────────────────────────

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  allCategories: Category[];
}

function CategoryModal({ isOpen, onClose, category, allCategories }: CategoryModalProps) {
  const isEditing = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName]             = useState(category?.name ?? "");
  const [slug, setSlug]             = useState(category?.slug ?? "");
  const [description, setDesc]      = useState(category?.description ?? "");
  const [parentId, setParentId]     = useState(category?.parentId ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError]           = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

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
      // Parse Zod field-level errors from ApiError.details
      if (Array.isArray(err?.details) && err.details.length > 0) {
        const fields: Record<string, string> = {};
        err.details.forEach((d: { field: string; message: string }) => {
          if (d.field) fields[d.field] = d.message;
        });
        setFieldErrors(fields);
        setError("");
      } else {
        setError(err?.message || "Something went wrong");
        setFieldErrors({});
      }
    }
  };

  if (!isOpen) return null;

  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
        {isEditing ? "Edit Category" : "New Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Category Name <span className="text-error-500">*</span></Label>
          <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Portable Cabins" />
          {fieldErrors.name && <p className="mt-1 text-xs text-error-500">{fieldErrors.name}</p>}
        </div>
        <div>
          <Label>URL Slug <span className="text-error-500">*</span></Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="portable-cabins"
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
            placeholder="Optional description for this category"
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

export default function CategoriesPage() {
  const { data, isLoading, error } = useCategories({ limit: 100 });
  const deleteMutation = useDeleteCategory();

  const categories: Category[] = data?.items ?? [];

  const [isModalOpen,  setModalOpen]  = useState(false);
  const [editCategory, setEditCat]    = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openCreate = () => { setEditCat(null); setModalOpen(true); };
  const openEdit   = (c: Category) => { setEditCat(c); setModalOpen(true); };
  const closeModal = () => { setEditCat(null); setModalOpen(false); };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  // Build parent name lookup
  const parentMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-pulse text-lg font-medium text-gray-500">Loading categories…</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <p className="font-medium text-error-500">Error loading categories. Check API connection.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Categories</h2>
          <p className="text-sm text-gray-500">{categories.length} categories · Nested hierarchy supported</p>
        </div>
        <Button onClick={openCreate} size="sm">+ New Category</Button>
      </div>

      {/* Table */}
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
                    {cat.parentId && (
                      <span className="text-gray-300 dark:text-gray-600">↳</span>
                    )}
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
                      {parentMap[cat.parentId] || "Unknown"}
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
                    <button onClick={() => openEdit(cat)}
                      className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(cat)}
                      className="text-sm font-semibold text-error-500 hover:text-error-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                    </svg>
                    <p className="font-medium">No categories yet</p>
                    <p className="text-sm">Click "+ New Category" to create your first one</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <CategoryModal
        key={editCategory?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={closeModal}
        category={editCategory}
        allCategories={categories}
      />

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Category</h3>
          <p className="mb-6 text-sm text-gray-500">
            Delete <span className="font-semibold text-gray-700 dark:text-white">{deleteTarget?.name}</span>? Products using this category will lose their assignment.
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
