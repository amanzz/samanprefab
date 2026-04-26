"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Product, ProductStatus } from "@/types/product.types";
import { API_CONFIG } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function ProductsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading, error, refetch } = useProducts({ 
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined
  });
  
  const products = data?.items || [];
  const deleteMutation = useDeleteProduct();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>();

  const handleCreate = () => router.push('/admin/products/new');
  const handleEdit = (product: Product) => router.push(`/admin/products/${product.id}`);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          refetch();
          setIsDeleteModalOpen(false);
        },
      });
    }
  };

  if (isLoading && !products.length) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading products library...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading products. Please check your API connection.</div>
      <p className="mt-2 text-xs text-gray-400">{(error as any)?.message}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Products</h2>
          <p className="text-sm text-gray-500">Manage your product inventory and settings.</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1 max-w-sm">
          <Input 
            placeholder="Search products..." 
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
            <option value={ProductStatus.ACTIVE}>Active</option>
            <option value={ProductStatus.DRAFT}>Draft</option>
            <option value={ProductStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Price Range</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {(product.mainImage || (product.gallery && product.gallery[0])) && (
                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={API_CONFIG.assetUrl(product.mainImage || (product.gallery && product.gallery[0]))} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-white/90">{product.name}</span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase leading-none mt-1">{product.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {product.priceDisplay || `₹${((product.priceMin || 0)/1000).toFixed(1)}k - ₹${((product.priceMax || 0)/1000).toFixed(1)}k`}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      // Normalize backend status to frontend format
                      const rawStatus = String(product.status).toLowerCase();
                      const normalizedStatus = rawStatus === 'published' ? 'active' : rawStatus;
                      const isActive = normalizedStatus === 'active';
                      const isDraft = normalizedStatus === 'draft';
                      
                      return (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' : 
                          isDraft ? 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' : 
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {isActive ? 'Published' : isDraft ? 'Draft' : 'Archived'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-brand-500 hover:text-brand-600 text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="text-error-500 hover:text-error-600 text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p>No products found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-md p-6 sm:p-8"
      >
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V14M12 17.5V18M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">Delete Product</h3>
          <p className="mb-8 text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-white">{productToDelete?.name}</span>? This action is permanent and cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-error-600 hover:bg-error-700 border-none" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
