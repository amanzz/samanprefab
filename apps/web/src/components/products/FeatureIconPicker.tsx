"use client";

import { useState } from "react";
import { FEATURE_ICONS } from "@/lib/feature-icons";

export interface FeatureIconValue {
  type: "icon" | "image";
  value: string;
}

interface FeatureIconPickerProps {
  isOpen: boolean;
  current?: FeatureIconValue;
  onSelect: (icon: FeatureIconValue) => void;
  onUseImage: () => void;
  onClose: () => void;
}

export default function FeatureIconPicker({
  isOpen,
  current,
  onSelect,
  onUseImage,
  onClose,
}: FeatureIconPickerProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedId = current?.type === "icon" ? current.value : null;

  const handlePick = (id: string) => {
    onSelect({ type: "icon", value: id });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Choose Icon</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Pick a predefined icon or use a custom image</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Icon Grid */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Predefined icons</p>
          <div className="grid grid-cols-6 gap-2">
            {FEATURE_ICONS.map((icon) => {
              const isSelected = selectedId === icon.id;
              const isHov = hovered === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  title={icon.label}
                  onClick={() => handlePick(icon.id)}
                  onMouseEnter={() => setHovered(icon.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition ${
                    isSelected
                      ? "bg-brand-50 ring-2 ring-brand-500 text-brand-600 dark:bg-brand-900/20"
                      : isHov
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: icon.innerHTML }}
                  />
                  <span className="text-[9px] font-medium leading-none truncate w-full text-center">{icon.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider + Image option */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>
          <button
            type="button"
            onClick={() => { onClose(); onUseImage(); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:border-brand-400 hover:text-brand-600 transition dark:border-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Upload custom image
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
          {current && (
            <button
              type="button"
              onClick={() => { onSelect({ type: "icon", value: "" }); onClose(); }}
              className="text-xs text-gray-400 hover:text-error-500 transition"
            >
              Remove icon
            </button>
          )}
          {!current && <span />}
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition dark:hover:bg-gray-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
