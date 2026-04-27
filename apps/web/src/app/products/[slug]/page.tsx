import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getPublicProductBySlug, listPublicProducts, getPublicSettings } from "@/services/pdp.service";
import ProductTabs from "@/components/products/pdp/ProductTabs";
import FAQAccordion from "@/components/products/pdp/FAQAccordion";
import JsonLd from "@/components/shared/JsonLd";
import { API_CONFIG } from "@/lib/api";
import { ICON_MAP } from "@/lib/feature-icons";
import type { PdpCustomButton } from "@/types/pdp-product.types";

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Button style map — mirrors exact admin preview colors ────────────────────
// Admin primary preview:   bg #3654c7, text white
// Admin secondary preview: border #dfe8f6, text #3654c7 (blue outline)
// WhatsApp type always green regardless of style field
function getButtonClass(btn: PdpCustomButton): string {
  if (btn.type === "whatsapp") {
    return "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20";
  }
  switch (btn.style) {
    case "primary":
      return "bg-[#3654c7] text-white hover:bg-[#2a44b0] shadow-md shadow-[#3654c7]/25";
    case "secondary":
      return "border-2 border-[#dfe8f6] text-[#3654c7] bg-white hover:bg-[#f0f5ff] dark:bg-transparent dark:border-[#3654c7]/40 dark:text-[#7a9cf5] dark:hover:bg-[#3654c7]/10";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) return {};
    return {
      title: `${product.title} | Premium B2B Prefab Cabins`,
      description: product.description
        ? product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
        : `Premium ${product.title} solutions.`,
      alternates: { canonical: `https://samanprefab.com/products/${slug}` },
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await getPublicProductBySlug(slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  // ── Images ───────────────────────────────────────────────────────────────
  const allImages = [product.featuredImage, ...(product.gallery || [])].filter(Boolean) as string[];
  const primaryImage = allImages[0] || "";
  const hasImage = Boolean(primaryImage.trim());
  const imageSrc = hasImage ? API_CONFIG.assetUrl(primaryImage) : "";

  // ── Settings ─────────────────────────────────────────────────────────────
  let settings: { whatsapp_number?: string } = {};
  try { settings = await getPublicSettings(); } catch { /* silent */ }
  const waNumber = settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const waMessage = encodeURIComponent(`Hi, I'm interested in ${product.title}`);

  // ── Related products ──────────────────────────────────────────────────────
  let relatedProducts: typeof product[] = [];
  try {
    const all = await listPublicProducts({ status: "published", limit: 10 });
    relatedProducts = (all.items || [])
      .filter((p) => p.id !== product!.id && p.category?.id === product!.category?.id)
      .slice(0, 3);
  } catch { /* silent */ }

  // ── JSON-LD ───────────────────────────────────────────────────────────────
  const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ? stripHtml(product.description).slice(0, 180) : product.title,
    image: imageSrc,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: "Saman Prefab" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: product.price?.min || 0,
      highPrice: product.price?.max || product.price?.min || 0,
      availability: "https://schema.org/InStock",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://samanprefab.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://samanprefab.com/products" },
      { "@type": "ListItem", position: 3, name: product.title, item: `https://samanprefab.com/products/${slug}` },
    ],
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const priceDisplay =
    product.priceText ||
    (product.price?.min ? `₹${product.price.min.toLocaleString("en-IN")}` : "Get Quote");

  const trustItems = [
    product.deliveryTime ? {
      label: "Delivery Time",
      value: product.deliveryTime,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="1"/>
          <path d="M16 8h4l3 5v3h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    } : null,
    product.warranty ? {
      label: "Warranty",
      value: product.warranty,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    } : null,
    product.installationTime ? {
      label: "Installation",
      value: product.installationTime,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
        </svg>
      ),
    } : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  const faqItems = (product.faq || []).map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 selection:bg-brand-500/30">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900 pt-8 md:pt-12 pb-16 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-6">

          {/* ── Pill breadcrumb ─────────────────────────────────────────── */}
          <nav aria-label="breadcrumb" className="flex items-center gap-2 mb-10 flex-wrap">
            <Link
              href="/"
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-300 dark:text-gray-700 text-xs">›</span>
            <Link
              href="/products"
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
            >
              Products
            </Link>
            <span className="text-gray-300 dark:text-gray-700 text-xs">›</span>
            <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold truncate max-w-[220px]">
              {product.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* LEFT: Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group">
                {hasImage ? (
                  <Image
                    src={imageSrc}
                    alt={product.title}
                    fill priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <span className="text-sm font-semibold uppercase tracking-widest">Image Unavailable</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <Image
                        src={API_CONFIG.assetUrl(img)}
                        alt={`${product.title} thumbnail ${idx + 2}`}
                        fill className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 10vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product info */}
            <div className="flex flex-col justify-center">

              {/* 1. Category badge */}
              {product.category?.name && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-black uppercase tracking-widest mb-4 w-fit border border-brand-100 dark:border-brand-800">
                  {product.category.name}
                </span>
              )}

              {/* 2. Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-4">
                {product.title}
              </h1>

              {/* 3. Short description */}
              {(product.shortDescription || product.description) && (
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-5 line-clamp-3">
                  {product.shortDescription ||
                    product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)}
                </p>
              )}

              {/* 4. Key Features (top 3–5) — hidden if none */}
              {product.features && product.features.length > 0 && (
                <ul className="mb-6 space-y-2.5">
                  {product.features.slice(0, 5).map((f, idx) => {
                    const iconDef = f.icon?.type === "icon" && f.icon.value ? ICON_MAP.get(f.icon.value) : null;
                    return (
                      <li key={f.title || idx} className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center text-[#3654c7]">
                          {f.icon?.type === "image" && f.icon.value ? (
                            <img
                              src={API_CONFIG.assetUrl(f.icon.value)}
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                          ) : iconDef ? (
                            <svg
                              width="18" height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              dangerouslySetInnerHTML={{ __html: iconDef.innerHTML }}
                            />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        {/* Text — title only in hero (full detail in Features tab) */}
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{f.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* 5. SKU + Price */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                {product.sku && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">SKU</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.sku}</span>
                    </div>
                    <div className="w-px h-9 bg-gray-200 dark:bg-gray-700" />
                  </>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pricing</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{priceDisplay}</span>
                </div>
              </div>

              {/* 6. CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <a
                  href="#quote"
                  className="flex-1 flex items-center justify-center px-7 py-4 rounded-xl bg-brand-600 text-white font-black uppercase tracking-widest text-sm hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5"
                >
                  Get Free Quote
                </a>
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-green-500 text-white font-black uppercase tracking-widest text-sm hover:bg-green-600 shadow-md shadow-green-500/20 transition-all hover:-translate-y-0.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Custom buttons from CMS */}
              {product.customButtons && product.customButtons.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-1">
                  {product.customButtons.slice(0, 3).map((btn, idx) => (
                    <a
                      key={idx}
                      href={
                        btn.type === "whatsapp"
                          ? `https://wa.me/${waNumber}?text=${encodeURIComponent(btn.label)}`
                          : btn.url
                      }
                      target={btn.type !== "whatsapp" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={`flex-1 min-w-[130px] flex items-center justify-center px-5 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${getButtonClass(btn)}`}
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
              )}

              {/* ── Trust block — CMS driven ─────────────────────────────── */}
              {trustItems.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 shadow-sm divide-x divide-gray-100 dark:divide-gray-800">
                    {trustItems.map((item) => (
                      <div key={item.label} className="flex flex-col items-center gap-2.5 px-3 py-5 text-center">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-[#3654c7]/10 dark:bg-[#3654c7]/20 flex items-center justify-center text-[#3654c7] dark:text-[#7a9cf5]">
                          {item.icon}
                        </div>
                        {/* Text */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. TABS
      ════════════════════════════════════════════════════════ */}
      <ProductTabs product={product} />

      {/* ════════════════════════════════════════════════════════
          3. FAQ — CMS-driven, hidden if empty
      ════════════════════════════════════════════════════════ */}
      {faqItems.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Everything you need to know about the {product.title}.
              </p>
            </div>
            <FAQAccordion items={faqItems} />
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          4. RELATED PRODUCTS — hidden if none
      ════════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-screen-2xl mx-auto px-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-12">
              Related Solutions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {p.featuredImage ? (
                      <Image
                        src={API_CONFIG.assetUrl(p.featuredImage)}
                        alt={p.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="6" y="6" width="36" height="36" rx="4" />
                          <path d="M6 30l10-10 8 8 6-6 8 8" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                      {p.title}
                    </h3>
                    {p.priceText && (
                      <p className="text-sm font-bold text-brand-600">{p.priceText}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          5. FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section id="quote" className="py-24 bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-10" />
        <div className="max-w-4xl mx-auto px-6 relative text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Need a Custom Engineering Solution?
          </h2>
          <p className="text-xl text-brand-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Our experts will design and manufacture the perfect {product.title.toLowerCase()} tailored to your project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white text-brand-700 font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all shadow-xl"
            >
              Request Project Estimate
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
