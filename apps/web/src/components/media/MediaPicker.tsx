"use client";

import React from "react";
import { useMedia } from "@/hooks/useMedia";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Image from "next/image";

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: string, url: string) => void;
  selectedIds: string[];
}

export default function MediaPicker({ isOpen, onClose, onSelect, selectedIds }: MediaPickerProps) {
  const { data, isLoading } = useMedia();
  const mediaItems = data?.items || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Select Media</h2>
        <p className="text-sm text-gray-500">Choose images for your product gallery.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-h-[50vh] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Loading media library...</div>
        ) : (
          mediaItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id, item.url)}
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                selectedIds.includes(item.id)
                  ? "border-brand-500 ring-4 ring-brand-500/10"
                  : "border-gray-100 hover:border-brand-200 dark:border-gray-800"
              }`}
            >
              <Image
                src={item.url}
                alt={item.altText || "Media"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
              {selectedIds.includes(item.id) && (
                <div className="absolute top-2 right-2 flex items-center justify-center">
                  <div className="rounded-full bg-brand-500 p-1 text-white shadow-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {!isLoading && mediaItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">
            No media found in the library.
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end border-t border-gray-100 pt-6 dark:border-gray-800">
        <Button onClick={onClose}>Close Gallery</Button>
      </div>
    </Modal>
  );
}
