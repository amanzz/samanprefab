"use client";

import React, { useState } from "react";
import { useSeoPages, useCreateSeoPage, useUpdateSeoPage } from "@/hooks/useSeoPages";
import { useCities } from "@/hooks/useCities";
import { useCategories } from "@/hooks/useCategories";
import { CitySeoPage } from "@/types/seo.types";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";

export default function SeoPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: seoPages, isLoading, error, refetch } = useSeoPages({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });
  const { data: citiesData } = useCities({ limit: 500 });
  const { data: categoriesData } = useCategories({ limit: 100 });

  const createMutation = useCreateSeoPage();
  const updateMutation = useUpdateSeoPage();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CitySeoPage | null>(null);

  const [createForm, setCreateForm] = useState({
    city_id: "",
    product_category_id: "",
    slug: "",
    status: "draft" as string,
    metaTitle: "",
    metaDescription: "",
    h1Override: "",
    customBlocks: [] as any[],
    priority: 50,
  });

  const [editForm, setEditForm] = useState({
    status: "draft" as string,
    metaTitle: "",
    metaDescription: "",
    h1Override: "",
    customBlocks: [] as any[],
    priority: 50,
  });

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const pages = seoPages?.items ?? [];
  const cities = citiesData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  const getCityName = (cityId: string) => cities.find((c) => c.id === cityId)?.name || cityId;
  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || catId;

  const autoGenerateSlug = (cityId: string, catId: string) => {
    const city = cities.find((c) => c.id === cityId);
    const cat = categories.find((c) => c.id === catId);
    if (city && cat) {
      return `${cat.slug}-in-${city.slug}`;
    }
    return "";
  };

  const handleCityChange = (city_id: string) => {
    setCreateForm((prev) => {
      const updated = { ...prev, city_id };
      updated.slug = autoGenerateSlug(city_id, prev.product_category_id);
      return updated;
    });
  };

  const handleCategoryChange = (product_category_id: string) => {
    setCreateForm((prev) => {
      const updated = { ...prev, product_category_id };
      updated.slug = autoGenerateSlug(prev.city_id, product_category_id);
      return updated;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    createMutation.mutate(createForm, {
      onSuccess: () => {
        refetch(); // Reload list
        setStatusMsg({ type: "success", text: "SEO page created successfully!" });
        setIsCreateOpen(false);
        setCreateForm({ city_id: "", product_category_id: "", slug: "", status: "draft", metaTitle: "", metaDescription: "", h1Override: "", customBlocks: [], priority: 50 });
      },
      onError: (err: any) => setStatusMsg({ type: "error", text: err.message || "Failed to create page" }),
    });
  };

  const handleEditOpen = (page: CitySeoPage) => {
    setEditingPage(page);
    setEditForm({
      status: page.status || "draft",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      h1Override: page.h1Override || "",
      customBlocks: page.customBlocks || [],
      priority: (page as any).priority || 50,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setStatusMsg(null);
    updateMutation.mutate(
      { id: editingPage.id, data: editForm },
      {
        onSuccess: () => {
          refetch(); // Reload list
          setStatusMsg({ type: "success", text: "SEO page updated successfully!" });
          setIsEditOpen(false);
          setEditingPage(null);
        },
        onError: (err: any) => setStatusMsg({ type: "error", text: err.message || "Failed to update" }),
      }
    );
  };

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading SEO pages...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading SEO pages.</div>
      <p className="mt-2 text-xs text-gray-400">{(error as any)?.message}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {statusMsg && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${
          statusMsg.type === "success"
            ? "bg-success-50 text-success-700 border-success-100 dark:bg-success-500/10 dark:border-success-500/20"
            : "bg-error-50 text-error-700 border-error-100 dark:bg-error-500/10 dark:border-error-500/20"
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">SEO & Landing Pages</h2>
          <p className="text-sm text-gray-500">Create city-based landing pages for programmatic SEO.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm">Create Page</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Label className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-gray-400">Status:</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="noindex">No Index</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Page Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">City</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Product Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Slug</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {p.metaTitle || p.h1Override || "Untitled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getCityName(p.city_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getCategoryName(p.product_category_id)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500">/{p.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.status === "published"
                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                        : p.status === "noindex"
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        : "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
                    }`}>
                      {p.status || "draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditOpen(p)}
                      className="text-brand-500 hover:text-brand-600 text-sm font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <p>No SEO pages found. Create one to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="max-w-2xl p-6 sm:p-8">
        <form onSubmit={handleCreate} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Create SEO Landing Page</h2>
            <p className="text-sm text-gray-500 mt-1">Generate a city-based landing page for SEO.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>City</Label>
              <select
                value={createForm.city_id}
                onChange={(e) => handleCityChange(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="">Select a city...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name} ({city.state})</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Product Category</Label>
              <select
                value={createForm.product_category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Page Slug (auto-generated)</Label>
            <Input
              value={createForm.slug}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
              required
              placeholder="prefab-house-in-mumbai"
            />
            <p className="mt-1 text-xs text-gray-400">Auto-generated from city + category. You can edit it.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Status</Label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="noindex">No Index</option>
              </select>
            </div>
            <div>
              <Label>Priority (0-100)</Label>
              <Input
                type="number"
                value={createForm.priority}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: parseInt(e.target.value) || 50 }))}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div>
            <Label>H1 Override</Label>
            <Input
              value={createForm.h1Override}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, h1Override: e.target.value }))}
              placeholder="Custom heading for this page"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={createForm.metaTitle}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO page title (max 70 chars)"
                maxLength={70}
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <TextArea
                value={createForm.metaDescription}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="SEO description for search results (max 165 chars)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} className="max-w-2xl p-6 sm:p-8">
        {editingPage && (
          <form onSubmit={handleUpdate} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Edit SEO Page</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-mono text-xs">/{editingPage.slug}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="noindex">No Index</option>
                </select>
              </div>
              <div>
                <Label>Priority (0-100)</Label>
                <Input
                  type="number"
                  value={editForm.priority}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, priority: parseInt(e.target.value) || 50 }))}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div>
              <Label>H1 Override</Label>
              <Input
                value={editForm.h1Override}
                onChange={(e) => setEditForm((prev) => ({ ...prev, h1Override: e.target.value }))}
                placeholder="Custom heading"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={editForm.metaTitle}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO page title"
                  maxLength={70}
                />
                <p className="mt-1 text-xs text-gray-400">{editForm.metaTitle.length}/70 characters</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <TextArea
                  value={editForm.metaDescription}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-400">{editForm.metaDescription.length}/165 characters</p>
              </div>
            </div>

            {/* Google Preview */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Google Preview</span>
              <div className="mt-4 space-y-1.5">
                <div className="text-xl font-medium text-brand-600 dark:text-brand-400 line-clamp-1">
                  {editForm.metaTitle || "Untitled Page"}
                </div>
                <div className="text-[13px] text-success-700 dark:text-success-400">
                  https://samanprefab.com/{editingPage.slug}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {editForm.metaDescription || "No description set."}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
