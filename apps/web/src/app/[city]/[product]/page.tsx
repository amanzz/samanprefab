import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { seoService } from "@/services/seo.service";
import QuoteWizard from "@/components/quote/QuoteWizard";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    city: string;
    product: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, product } = await params;
  try {
    const page = await seoService.getBySlug(city, product);
    return {
      title: page.metaTitle || `${product.replace(/-/g, " ")} in ${city} | Saman Prefab`,
      description: page.metaDescription || `Premium ${product.replace(/-/g, " ")} solutions in ${city}.`,
      alternates: {
        canonical: `https://samanprefab.com/${city}/${product}`,
      },
      openGraph: {
        title: page.metaTitle || `${product.replace(/-/g, " ")} in ${city}`,
        description: page.metaDescription || "",
      },
    };
  } catch {
    return {
      title: `${product.replace(/-/g, " ")} in ${city} | Saman Prefab`,
      description: `Premium ${product.replace(/-/g, " ")} solutions in ${city}. High-quality prefab structures with fast delivery.`,
    };
  }
}

export default async function SeoPage({ params }: Props) {
  const { city, product } = await params;
  let page;
  try {
    page = await seoService.getBySlug(city, product);
  } catch {
    notFound();
  }

  const heading = page.h1Override || page.metaTitle || `${product.replace(/-/g, " ")} in ${city}`;
  const description = page.metaDescription || `Premium ${product.replace(/-/g, " ")} solutions in ${city}.`;
  const blocks: any[] = Array.isArray(page.customBlocks) ? page.customBlocks : [];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: heading,
    description: description,
    brand: { "@type": "Brand", name: "Saman Prefab" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Modern SEO Hero */}
      <div className="relative pt-16 md:pt-24 pb-32 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-600/5 blur-3xl -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <nav className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-300">{city}</span>
              <span className="text-gray-300">/</span>
              <span className="text-brand-600">{product.replace(/-/g, " ")}</span>
            </nav>
            <h1 className="text-4xl font-black leading-[1.1] text-gray-900 dark:text-white md:text-7xl capitalize tracking-tighter">
              {heading}
            </h1>
            <p className="mt-8 text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#quote" className="rounded-2xl bg-brand-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all">
                Get Local Pricing
              </a>
              <a href="https://wa.me/91XXXXXXXXXX" className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white hover:bg-gray-50 transition-all">
                WhatsApp Callback
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-8 space-y-20">
            <article className="prose prose-lg prose-brand dark:prose-invert max-w-none">
              {blocks.map((block: any, idx: number) => {
                if (block.type === "text") {
                  return (
                    <section key={idx} className="mb-16">
                      {block.title && (
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">{block.title}</h2>
                      )}
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-6 text-lg">
                        {block.content?.split("\n").map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </section>
                  );
                }
                return null;
              })}

              {page.aiGeneratedContent && (
                <section className="mb-16">
                  <div
                    className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-6 text-lg"
                    dangerouslySetInnerHTML={{ __html: page.aiGeneratedContent }}
                  />
                </section>
              )}
            </article>

            {/* Sticky/Prominent Quote Form */}
            <section id="quote" className="relative group">
              <div className="absolute -inset-4 bg-brand-600/10 blur-3xl rounded-[4rem] group-hover:bg-brand-600/20 transition-all duration-700" />
              <div className="relative rounded-[4rem] bg-white dark:bg-gray-800 p-10 md:p-20 shadow-2xl border border-brand-100 dark:border-brand-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <svg width="200" height="200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <div className="mb-16 text-center max-w-2xl mx-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">Local Inventory</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Service in {city}
                  </h2>
                  <p className="mt-6 text-xl text-gray-500">
                    Saman Prefab operates a dedicated delivery hub for {city}. Submit your site dimensions for an engineering estimate.
                  </p>
                </div>
                <QuoteWizard />
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-28 space-y-12">
              {page.internalLinks && page.internalLinks.length > 0 && (
                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-8">
                    Related Solutions
                  </h4>
                  <div className="flex flex-col gap-5">
                    {page.internalLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between py-2 text-sm font-bold text-gray-600 hover:text-brand-600 dark:text-gray-400 transition-colors"
                      >
                        <span>{link.text}</span>
                        <span className="transition-transform group-hover:translate-x-2 text-brand-600">&rarr;</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[2.5rem] border border-gray-100 bg-gray-50 p-10 shadow-xl dark:border-gray-800 dark:bg-gray-800/50">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
                  Nearby Operations
                </h4>
                <div className="flex flex-col gap-5">
                  {["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai"].filter(c => c.toLowerCase() !== city.toLowerCase()).slice(0, 5).map((c) => (
                    <a
                      key={c}
                      href={`/${c.toLowerCase()}/${product}`}
                      className="group flex items-center justify-between py-2 text-sm font-bold text-gray-600 hover:text-brand-600 dark:text-gray-400 transition-colors"
                    >
                      <span>{product.replace(/-/g, " ")} in {c}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-all text-brand-600">&rarr;</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="rounded-[2.5rem] bg-brand-600 p-10 text-white shadow-2xl">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <h4 className="text-xl font-bold mb-2">ISO 9001:2015</h4>
                <p className="text-sm text-white/70 leading-relaxed">Our {city} operations follow international standards for manufacturing safety and quality.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
