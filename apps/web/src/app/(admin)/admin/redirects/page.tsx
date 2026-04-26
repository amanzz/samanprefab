"use client";

import React, { useState } from "react";
import { useRedirects, useCreateRedirect, useDeleteRedirect } from "@/hooks/useRedirects";
import { useNotFoundLog, useResolveNotFound } from "@/hooks/useNotFoundLog";
import { Redirect } from "@/types/redirect.types";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type ActiveTab = "redirects" | "404-log";

export default function RedirectsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("redirects");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">URL Redirects & 404 Log</h2>
          <p className="text-sm text-gray-500">Manage redirects for SEO and monitor broken URLs.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900 max-w-md">
        <button
          onClick={() => setActiveTab("redirects")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "redirects"
              ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Redirects
        </button>
        <button
          onClick={() => setActiveTab("404-log")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "404-log"
              ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          404 Log
        </button>
      </div>

      {activeTab === "redirects" ? <RedirectsTab /> : <NotFoundTab />}
    </div>
  );
}

function RedirectsTab() {
  const { data, isLoading, error } = useRedirects();
  const redirects = data?.items || [];
  const createMutation = useCreateRedirect();
  const deleteMutation = useDeleteRedirect();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Redirect>>({
    fromPath: "",
    toPath: "",
    statusCode: 301,
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsAddOpen(false);
        setFormData({ fromPath: "", toPath: "", statusCode: 301, isActive: true });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this redirect rule?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading redirect rules...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading redirects.</div>
    </div>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsAddOpen(true)} size="sm">Add Redirect</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Source Path</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Target Path</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {redirects.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{rule.fromPath}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{rule.toPath}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      rule.statusCode === 301 ? "bg-success-50 text-success-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {rule.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-error-500 hover:text-error-600 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic">
                    No redirect rules active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} className="max-w-md p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Add New Redirect</h2>
          <div className="space-y-4">
            <div>
              <Label>Source Path (From)</Label>
              <Input
                value={formData.fromPath}
                onChange={(e) => setFormData((prev) => ({ ...prev, fromPath: e.target.value }))}
                placeholder="/old-page"
                required
              />
            </div>
            <div>
              <Label>Target Path (To)</Label>
              <Input
                value={formData.toPath}
                onChange={(e) => setFormData((prev) => ({ ...prev, toPath: e.target.value }))}
                placeholder="/new-page"
                required
              />
            </div>
            <div>
              <Label>Status Code</Label>
              <select
                value={formData.statusCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, statusCode: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function NotFoundTab() {
  const { data, isLoading, error } = useNotFoundLog();
  const resolveMutation = useResolveNotFound();
  const entries = data?.items || [];

  if (isLoading) return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading 404 log...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading 404 log.</div>
      <p className="mt-2 text-xs text-gray-400">{(error as any)?.message}</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Broken URL</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Hits</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Last Seen</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{entry.path}</span>
                  {entry.referrer && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[300px]">
                      from: {entry.referrer}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-xs font-bold text-error-700 dark:bg-error-500/10 dark:text-error-400">
                    {entry.count}x
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(entry.lastSeenAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {entry.resolvedAt ? (
                    <span className="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700 uppercase dark:bg-success-500/10 dark:text-success-400">
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-error-50 px-2 py-0.5 text-[10px] font-bold text-error-700 uppercase dark:bg-error-500/10 dark:text-error-400">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!entry.resolvedAt && (
                    <button
                      onClick={() => resolveMutation.mutate(entry.id)}
                      className="text-success-600 hover:text-success-700 text-sm font-semibold transition-colors"
                      disabled={resolveMutation.isPending}
                    >
                      Mark Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No 404 errors logged. Your site is healthy!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
