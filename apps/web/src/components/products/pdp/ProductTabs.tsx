"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { API_CONFIG } from "@/lib/api";
import { ICON_MAP } from "@/lib/feature-icons";
import type { PdpProduct } from "@/types/pdp-product.types";

interface ProductTabsProps {
  product: PdpProduct;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  // ── Spec entries ────────────────────────────────────────────────────────────
  const specEntries =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications)
      : [];

  // ── Build visible tabs (only tabs with content) ────────────────────────────
  const allTabs = [
    { id: "description", label: "Description", always: true },
    {
      id: "features",
      label: "Features",
      show: product.showFeatures && product.features && product.features.length > 0,
    },
    {
      id: "specifications",
      label: "Specifications",
      show: specEntries.length > 0,
    },
    {
      id: "applications",
      label: "Applications",
      show: product.showApplications && product.applications && product.applications.length > 0,
    },
  ].filter((t) => t.always || t.show);

  // Desktop: active tab state
  const [activeTab, setActiveTab] = useState(allTabs[0]?.id || "description");

  // Mobile: accordion open state (description open by default)
  const [openAccordion, setOpenAccordion] = useState<string>(allTabs[0]?.id || "description");

  // Refs to each accordion header buttons
  const accordionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleAccordion = (id: string) => {
    const isOpening = openAccordion !== id;
    if (!isOpening) {
      setOpenAccordion("");
      return;
    }

    const targetBtn = accordionRefs.current[id];
    const currentOpenBtn = openAccordion ? accordionRefs.current[openAccordion] : null;

    // Measure how much the currently-open accordion will shrink.
    // We only need to compensate when the CLOSING item is ABOVE the one being opened.
    let shrinkAmount = 0;
    if (currentOpenBtn && targetBtn) {
      const closingIsAbove =
        currentOpenBtn.getBoundingClientRect().top < targetBtn.getBoundingClientRect().top;
      if (closingIsAbove) {
        // nextElementSibling = the content wrapper div
        const contentEl = currentOpenBtn.nextElementSibling as HTMLElement | null;
        shrinkAmount = contentEl?.offsetHeight ?? 0;
      }
    }

    // Calculate where the target button will be after shrink
    const targetDocTop =
      (targetBtn?.getBoundingClientRect().top ?? 0) + window.scrollY - shrinkAmount;

    setOpenAccordion(id);

    // Immediately jump scroll to compensate for layout shift, then smooth to target
    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, targetDocTop - 90), behavior: "smooth" });
    });
  };

  // ── Shared tab content renderer ────────────────────────────────────────────
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case "description":
        return product.description ? (
          <div
            className="prose prose-lg prose-gray dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-p:text-gray-600 dark:prose-p:text-gray-400
              prose-li:text-gray-600 dark:prose-li:text-gray-400
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
            Experience premium quality with our {product.title}. Designed for maximum efficiency and durability.
          </p>
        );

      case "features":
        return product.features && product.features.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Key Features</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">What makes the {product.title} stand out.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((f, idx) => (
                <div
                  key={f.title || idx}
                  className="flex gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[#3654c7] shadow-sm overflow-hidden">
                    {f.icon?.type === "image" && f.icon.value ? (
                      <Image src={API_CONFIG.assetUrl(f.icon.value)} alt={f.title} width={22} height={22} className="object-contain" />
                    ) : f.icon?.type === "icon" && f.icon.value && ICON_MAP.get(f.icon.value) ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICON_MAP.get(f.icon.value)!.innerHTML }} />
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 9l4 4L14 6" /></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white leading-snug">{f.title}</h4>
                    {f.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{f.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null;

      case "specifications":
        return specEntries.length > 0 ? (
          <div className="max-w-4xl border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                {specEntries.map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <th className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white bg-gray-50/80 dark:bg-gray-800/20 w-[38%]">{label}</th>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Specifications will be added soon.</p>
          </div>
        );

      case "applications":
        return product.applications && product.applications.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Where It's Used</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Common deployment environments for the {product.title}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.applications.map((app, idx) => (
                <div key={app.title || idx} className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800/30">
                  {app.image ? (
                    <div className="relative w-full h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image src={API_CONFIG.assetUrl(app.image)} alt={app.title || "Application image"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-20 flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400">
                        <path d="M4.5 19.5l7.5-7.5 7.5 7.5 7.5-7.5" /><path d="M3 12l9-9 9 9v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-5 flex-1">
                    <h4 className="text-base font-black text-gray-900 dark:text-white mb-1.5">{app.title}</h4>
                    {app.description && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{app.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-screen-2xl mx-auto px-6">

        {/* ══════════════════════════════════════════════════════
            DESKTOP: Pill Tab Navigation (md+)
        ══════════════════════════════════════════════════════ */}
        <div className="hidden md:block">
          <div className="flex overflow-x-auto pt-8 mb-12">
            <div className="flex items-center gap-2 min-w-max pb-px border-b border-gray-200 dark:border-gray-800 w-full">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                  className={`relative px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop tab content */}
          <div className="pb-24">
            {allTabs.map((tab) => (
              <div
                key={tab.id}
                className={`transition-all duration-300 ${tab.id === "description" ? "max-w-3xl" : ""} ${
                  activeTab === tab.id
                    ? "opacity-100 visible"
                    : "opacity-0 h-0 overflow-hidden pointer-events-none"
                }`}
              >
                {renderTabContent(tab.id)}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE: Accordion (< md)
        ══════════════════════════════════════════════════════ */}
        <div className="md:hidden py-6 space-y-3">
          {allTabs.map((tab) => {
            const isOpen = openAccordion === tab.id;
            return (
              <div
                key={tab.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-brand-200 dark:border-brand-800 shadow-sm shadow-brand-600/5"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                {/* Accordion Header */}
                <button
                  ref={(el) => { accordionRefs.current[tab.id] = el; }}
                  onClick={() => toggleAccordion(tab.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors scroll-mt-24 ${
                    isOpen
                      ? "bg-brand-50 dark:bg-brand-900/20"
                      : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <span className={`text-sm font-black tracking-wide uppercase ${
                    isOpen ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {tab.label}
                  </span>
                  <span className={`flex-shrink-0 ml-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen
                      ? "bg-brand-600 text-white rotate-180"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5l4 4 4-4" />
                    </svg>
                  </span>
                </button>

                {/* Accordion Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className={`px-5 py-5 bg-white dark:bg-gray-900 ${tab.id === "description" ? "" : ""}`}>
                    {renderTabContent(tab.id)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
