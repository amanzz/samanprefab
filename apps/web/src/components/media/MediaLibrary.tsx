"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useMedia, useUploadMedia } from "@/hooks/useMedia";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user clicks the confirm button. Receives array of selected URLs. */
  onConfirm: (urls: string[]) => void;
  /** URLs already selected — pre-highlighted when modal opens. */
  preselectedUrls?: string[];
  /** 'single' replaces selection on click; 'multiple' toggles. Default: 'multiple' */
  mode?: "single" | "multiple";
  title?: string;
  confirmLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const imgSrc = (url: string) =>
  url?.startsWith("http") ? url : url || "";

// ─── Component ────────────────────────────────────────────────────────────────

export default function MediaLibrary({
  isOpen,
  onClose,
  onConfirm,
  preselectedUrls = [],
  mode = "multiple",
  title = "Media Library",
  confirmLabel,
}: MediaLibraryProps) {
  const { data, isLoading } = useMedia();
  const uploadMutation = useUploadMedia();
  const mediaItems = data?.items || [];

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset selection to preselected when modal opens - intentional reset pattern
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(preselectedUrls));
      setImgErrors(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [isOpen]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const toggleSelect = useCallback(
    (url: string) => {
      setSelected((prev) => {
        if (mode === "single") return new Set([url]);
        const next = new Set(prev);
        if (next.has(url)) next.delete(url);
        else next.add(url);
        return next;
      });
    },
    [mode]
  );

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selected));
  }, [selected, onConfirm]);

  // ── Upload ────────────────────────────────────────────────────────────────

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      for (const file of imageFiles) {
        await uploadMutation.mutateAsync(file);
      }
    },
    [uploadMutation]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) uploadFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!(e.currentTarget as Node).contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) await uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleImgError = useCallback((url: string) => {
    setImgErrors((prev) => new Set([...prev, url]));
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedCount = selected.size;
  const btnLabel =
    confirmLabel ??
    (mode === "single"
      ? "Use This Image"
      : selectedCount === 0
      ? "Select Images"
      : `Use ${selectedCount} Image${selectedCount > 1 ? "s" : ""}`);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-5xl p-0 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {mode === "single"
              ? "Click an image to select it, then confirm"
              : "Click images to toggle selection, then confirm"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Drag-and-drop upload zone ───────────────────────────────────────── */}
      <div
        className={`mx-6 mt-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
            : "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {uploadMutation.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle className="opacity-25" cx="12" cy="12" r="10" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-medium text-brand-600">Uploading…</span>
              </>
            ) : isDragging ? (
              <>
                <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="font-semibold text-brand-600">Drop to upload</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>Drag images here to upload, or</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Browse Files
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {uploadMutation.isError && (
        <p className="mx-6 mt-2 text-xs font-medium text-error-600">
          Upload failed: {(uploadMutation.error as any)?.message || "Unknown error"}
        </p>
      )}

      {/* ── Image Grid ─────────────────────────────────────────────────────── */}
      <div className="mx-6 mt-4 max-h-[52vh] overflow-y-auto pb-1">
        {isLoading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium text-gray-500">No images in library</p>
            <p className="mt-1 text-sm">Upload images using the area above</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {mediaItems.map((item) => {
              const url = imgSrc(item.url);
              const isSelected = selected.has(item.url);
              const hasError = imgErrors.has(item.url);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSelect(item.url)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                    isSelected
                      ? "border-brand-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)] scale-[0.97]"
                      : "border-gray-200 hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:hover:border-brand-500"
                  }`}
                >
                  {/* Thumbnail */}
                  {hasError ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
                      <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={item.altText || item.originalName}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={() => handleImgError(item.url)}
                      loading="lazy"
                    />
                  )}

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-500/20 transition-opacity" />
                  )}

                  {/* Filename on hover / always when selected */}
                  <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2 transition-opacity duration-200 ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    <p className="truncate text-[10px] font-medium leading-tight text-white">
                      {item.originalName}
                    </p>
                  </div>

                  {/* Checkmark badge */}
                  {isSelected && (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 shadow-lg ring-2 ring-white">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {/* "Selected" pill label */}
                  {isSelected && (
                    <div className="absolute left-1.5 top-1.5 rounded bg-brand-500 px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wider text-white shadow">
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
        <p className="text-sm">
          {selectedCount > 0 ? (
            <span className="font-semibold text-brand-600">
              {selectedCount} image{selectedCount !== 1 ? "s" : ""} selected
            </span>
          ) : (
            <span className="text-gray-400">No images selected</span>
          )}
          {mediaItems.length > 0 && (
            <span className="text-gray-300 dark:text-gray-600">
              {" "}· {mediaItems.length} in library
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="min-w-[150px] transition-all"
          >
            {btnLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
