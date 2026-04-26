"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMedia, useUploadMedia, useDeleteMedia, useUpdateMediaMetadata } from "@/hooks/useMedia";
import { MediaFile } from "@/types/media.types";
import Button from "@/components/ui/button/Button";
import { API_CONFIG } from "@/lib/api";
import { Modal } from "@/components/ui/modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBytes = (n: number) => {
  if (!n) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

type ConvertFormat = { readonly label: string; readonly mime: string; readonly ext: string };
const CONVERT_FORMATS: ConvertFormat[] = [
  { label: "WEBP", mime: "image/webp", ext: "webp" },
  { label: "JPG",  mime: "image/jpeg", ext: "jpg"  },
  { label: "PNG",  mime: "image/png",  ext: "png"  },
];

async function clientConvert(
  imageUrl: string, mime: string, quality: number, ext: string, originalName: string
): Promise<File> {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error("Could not fetch image for conversion");
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob(
        (b) => {
          URL.revokeObjectURL(objectUrl);
          if (!b) { reject(new Error("Canvas conversion returned null")); return; }
          const base = originalName.replace(/\.[^.]+$/, "");
          resolve(new File([b], `${base}-converted.${ext}`, { type: mime }));
        },
        mime,
        quality / 100
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image decode failed")); };
    img.src = objectUrl;
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MediaPage() {
  const { data, isLoading, error } = useMedia();
  const mediaFiles = data?.items || [];
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const updateMeta     = useUpdateMediaMetadata();
  const fileInputRef   = useRef<HTMLInputElement>(null);

  // Selection & panel
  const [selected,    setSelected]    = useState<MediaFile | null>(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [isDeleteOpen,setDeleteOpen]  = useState(false);
  const [copied,      setCopied]      = useState(false);

  // Metadata edit
  const [altText,   setAltText]   = useState("");
  const [metaSaved, setMetaSaved] = useState(false);

  // Convert
  const [convertFmt,     setConvertFmt]     = useState(CONVERT_FORMATS[0]);
  const [convertQuality, setConvertQuality] = useState(85);
  const [isConverting,   setIsConverting]   = useState(false);
  const [convertErr,     setConvertErr]     = useState("");

  // ── Upload helpers ─────────────────────────────────────────────────────────

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    for (const f of Array.from(files)) {
      if (f.type.startsWith("image/")) await uploadMutation.mutateAsync(f);
    }
  }, [uploadMutation]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const copyUrl = () => {
    if (!selected) return;
    navigator.clipboard.writeText(API_CONFIG.assetUrl(selected.url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveMeta = () => {
    if (!selected) return;
    updateMeta.mutate(
      { id: selected.id, data: { altText } },
      { onSuccess: () => setMetaSaved(true) }
    );
  };

  const handleConvert = async () => {
    if (!selected) return;
    setConvertErr("");
    setIsConverting(true);
    try {
      const file = await clientConvert(
        selected.url, convertFmt.mime, convertQuality,
        convertFmt.ext, selected.originalName
      );
      await uploadMutation.mutateAsync(file);
    } catch (e: any) {
      setConvertErr(e.message || "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteMutation.mutate(selected.id, {
      onSuccess: () => { setDeleteOpen(false); setSelected(null); },
    });
  };

  // ── Render: loading / error ────────────────────────────────────────────────

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="animate-pulse text-sm font-medium text-gray-400">Loading media library…</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="font-medium text-error-500">Failed to load media library. Check API connection.</p>
    </div>
  );

  // ── Render: main ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">Media Library</h1>
          <p className="mt-0.5 text-xs text-gray-400">
            {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""} · Click an image to inspect
          </p>
        </div>
        <div className="flex items-center gap-3">
          {uploadMutation.isPending && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Uploading…
            </span>
          )}
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Upload
            </span>
          </Button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />

      {uploadMutation.isError && (
        <div className="flex-shrink-0 border-b border-error-100 bg-error-50 px-6 py-3 text-sm font-medium text-error-700 dark:border-error-500/20 dark:bg-error-500/10">
          Upload failed: {(uploadMutation.error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* ── Body: 2-column split ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT: Drag-zone + Grid ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6">

          {/* Drag-and-drop upload strip */}
          <div
            className={`mb-5 flex-shrink-0 rounded-xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                : "border-gray-200 hover:border-brand-300 dark:border-gray-700"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!(e.currentTarget as Node).contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                {isDragging
                  ? <span className="font-semibold text-brand-600">Drop images here to upload</span>
                  : <span>Drag images here to upload</span>
                }
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Browse files
              </button>
            </div>
          </div>

          {/* Grid */}
          {mediaFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 dark:border-gray-800 dark:bg-gray-900">
              <svg className="mb-3 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="font-medium text-gray-400">No images yet</p>
              <p className="mt-1 text-sm text-gray-300">Drop images above or click Upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {mediaFiles.map((file) => {
                const isActive = selected?.id === file.id;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelected(file)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150 focus:outline-none ${
                      isActive
                        ? "border-brand-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)] scale-[0.96]"
                        : "border-gray-200 hover:border-brand-300 hover:shadow-md dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.altText || file.originalName}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                    />
                    {isActive && <div className="absolute inset-0 bg-brand-500/20" />}
                    {isActive && (
                      <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 ring-2 ring-white shadow-md">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <p className="truncate text-[10px] font-medium text-white">{file.originalName}</p>
                      <p className="text-[9px] text-white/60">{formatBytes(file.sizeBytes)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Detail Panel ─────────────────────────────────────────── */}
        {selected ? (
          <div className="flex w-[320px] flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

            {/* ── Image preview (60% of panel) ── */}
            <div className="relative flex h-[220px] w-full flex-shrink-0 items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-950">
              <img
                key={selected.id}
                src={selected.url}
                alt={selected.altText || selected.originalName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-gray-600 shadow hover:bg-white dark:bg-gray-800/80 dark:text-gray-300"
                title="Close panel"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Metadata + Tools (scrollable) ── */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">

              {/* Filename */}
              <div>
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Filename</p>
                <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{selected.originalName}</p>
              </div>

              {/* Stats grid */}
              {(() => {
                const origExt = (selected.originalName.split('.').pop() || 'jpg').toUpperCase();
                const optimExt = (selected.mimeType.split('/')[1] || 'webp').toUpperCase();
                const isSameFormat = origExt === optimExt;
                return (
                  <div className="grid grid-cols-2 gap-2">
                    <MetaChip label="Size" value={formatBytes(selected.sizeBytes)} />
                    <div className="rounded-xl bg-gray-100 p-2.5 dark:bg-gray-800">
                      <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Format</p>
                      {isSameFormat ? (
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{origExt}</p>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-700">{origExt}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">WEBP</span>
                        </div>
                      )}
                    </div>
                    {selected.width && selected.height && (
                      <MetaChip label="Dimensions" value={`${selected.width} × ${selected.height}`} />
                    )}
                    <MetaChip label="Uploaded" value={new Date(selected.createdAt).toLocaleDateString()} />
                  </div>
                );
              })()}

              {/* URL copy */}
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">Image URL</p>
                <div className="flex gap-1.5">
                  <input
                    readOnly
                    value={API_CONFIG.assetUrl(selected.url)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* ── Alt Text Editor (Task 4) ──────────────────────────────── */}
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">Alt Text (SEO)</p>
                <textarea
                  value={altText}
                  onChange={(e) => { setAltText(e.target.value); setMetaSaved(false); }}
                  rows={2}
                  placeholder="Describe this image for search engines…"
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`text-[11px] transition-opacity ${metaSaved ? "text-success-500 opacity-100" : "opacity-0"}`}>
                    ✓ Saved
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveMeta}
                    disabled={updateMeta.isPending || altText === (selected.altText || "")}
                    className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
                  >
                    {updateMeta.isPending ? "Saving…" : "Save Alt Text"}
                  </button>
                </div>
              </div>

              {/* ── Convert & Compress (Task 3) ──────────────────────────── */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">Convert & Compress</p>

                {/* Format selector */}
                <div className="mb-3 flex gap-1.5">
                  {CONVERT_FORMATS.map((f) => (
                    <button
                      key={f.mime}
                      type="button"
                      onClick={() => setConvertFmt(f)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                        convertFmt.mime === f.mime
                          ? "bg-brand-500 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-500 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Quality slider */}
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Quality</span>
                    <span className={`text-[11px] font-bold ${convertQuality < 60 ? "text-warning-500" : "text-gray-600 dark:text-gray-300"}`}>
                      {convertQuality}%
                    </span>
                  </div>
                  <input
                    type="range" min={20} max={100} value={convertQuality}
                    onChange={(e) => setConvertQuality(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    Est. size: ~{Math.round(selected.sizeBytes * convertQuality / 100 / 1024)} KB
                  </p>
                </div>

                {convertErr && (
                  <p className="mb-2 text-[11px] font-medium text-error-600">{convertErr}</p>
                )}

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting || uploadMutation.isPending}
                  className="w-full rounded-lg bg-gray-800 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-40 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {isConverting ? "Converting…" : `Convert to ${convertFmt.label} & Save`}
                </button>
              </div>

              {/* Delete */}
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="w-full rounded-lg border border-error-200 py-2 text-xs font-bold text-error-600 transition-colors hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                >
                  Delete Image
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for right panel */
          <div className="flex w-[280px] flex-shrink-0 flex-col items-center justify-center gap-3 border-l border-gray-200 bg-white text-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-700">
            <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-sm font-medium">Select an image</p>
          </div>
        )}
      </div>

      {/* ── Copied toast ──────────────────────────────────────────────────────── */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          ✓ URL copied to clipboard
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} className="max-w-md p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Image?</h3>
          <p className="mb-8 text-sm text-gray-500">
            Permanently delete{" "}
            <span className="font-semibold text-gray-700 dark:text-white">{selected?.originalName}</span>?
            This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-error-600 hover:bg-error-700"
              onClick={handleDelete}
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

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</p>
    </div>
  );
}
