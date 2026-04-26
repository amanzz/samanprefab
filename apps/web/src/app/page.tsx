"use client";

import React from "react";
import QuoteWizard from "@/components/quote/QuoteWizard";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section - Fixed with proper contrast and overlay */}
      <section className="relative min-h-[calc(100vh-var(--header-height))] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero.png"
            alt="Premium Prefab Cabin"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                India's Leading Manufacturer
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
              Portable <span className="text-blue-400">Cabins</span> <br />
              Manufacturer in India
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-gray-100 max-w-xl leading-relaxed font-medium">
              Engineering high-fidelity prefab structures for industrial, commercial, and luxury residential needs. Precision modular solutions delivered pan-India.
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="#quote-section" className="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 hover:shadow-2xl transition-all duration-300">
                Get Instant Quote
              </Link>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Trust Indicators */}
      <section className="py-12 md:py-16 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { number: '500+', label: 'Projects Delivered', icon: '🏗️' },
              { number: '15+', label: 'Years Experience', icon: '⚡' },
              { number: '28', label: 'States Covered', icon: '🚛' },
              { number: '100%', label: 'On-Time Delivery', icon: '✓' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-sm md:text-base font-medium text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories - Enhanced with better overlays and hover effects */}
      <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Premium Solutions</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Product Categories</h2>
            <div className="mx-auto mt-4 h-1 w-20 bg-blue-600 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: 'Portable Office Cabins', img: '/assets/images/hero.png', desc: 'Luxury onsite workspaces designed for high-performance teams.' },
              { title: 'Modular Worker Housing', img: '/assets/images/worker-housing.png', desc: 'Durable and scalable accommodation for industrial labor forces.' },
              { title: 'Premium Security Posts', img: '/assets/images/security-post.png', desc: 'Modern, weather-resistant cabins for high-security access control.' },
            ].map((item, idx) => (
              <div key={idx} className="group overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-2">
                <div className="relative h-72 md:h-80 w-full overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">{item.desc}</p>
                  <Link href="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider group/link hover:gap-3 transition-all">
                    Explore Range
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Toughest Terrains - Enhanced with background and icons */}
      <section id="benefits" className="py-20 md:py-28 bg-slate-50 dark:bg-gray-900/50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl z-10 border-4 border-white dark:border-gray-800 transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/assets/images/factory.png"
                  alt="Saman Prefab Factory"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl -z-10" />
              <div className="absolute -top-8 -left-8 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl -z-10" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Precision Engineering</span>
              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Built for the <span className="text-blue-600">Toughest</span> Terrains.
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                At Saman Prefab, we don't just build cabins; we engineer environments. Every structure is a result of meticulous structural analysis and premium material selection.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  {
                    title: 'Durable GI Framework',
                    desc: 'Industrial-grade galvanized iron frames resistant to corrosion and high-wind loads.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                      </svg>
                    )
                  },
                  {
                    title: 'Rapid Site Deployment',
                    desc: 'Engineered for speed. Our units are delivered 90% pre-assembled for 24-hour site setup.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    )
                  },
                  {
                    title: 'Custom Thermal Mapping',
                    desc: 'PUF/EPS sandwich panels tailored to your site climate for maximum energy efficiency.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 4h6v6" /><path d="M10 14l6-6" /><path d="M20 10v10H4V4h10" />
                      </svg>
                    )
                  },
                ].map((b, i) => (
                  <div key={i} className="flex gap-4 md:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 shadow-sm border border-blue-100 dark:border-blue-500/20">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{b.title}</h4>
                      <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Process Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Simple Process</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">From consultation to installation in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: '01', title: 'Consultation', desc: 'Share your requirements. We analyze your site and needs.', icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                )
              },
              {
                step: '02', title: 'Design & Quote', desc: 'Get detailed 3D designs and transparent pricing within 24 hours.', icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                )
              },
              {
                step: '03', title: 'Manufacturing', desc: 'Precision manufacturing with premium materials at our facility.', icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>
                )
              },
              {
                step: '04', title: 'Installation', desc: 'Rapid on-site installation by our expert team. Ready to use.', icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                )
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 h-full border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-3xl font-black text-blue-100 dark:text-blue-500/30">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-300 dark:text-blue-500/50"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Solutions</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Industries We Serve</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Customized prefab solutions for diverse sectors across India</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Construction', icon: '🏗️', desc: 'Site offices, worker housing' },
              { name: 'Mining & Oil', icon: '⛏️', desc: 'Remote camp facilities' },
              { name: 'Events & Exhibitions', icon: '🎪', desc: 'Temporary pavilions' },
              { name: 'Education', icon: '🎓', desc: 'Classrooms, labs, hostels' },
              { name: 'Healthcare', icon: '🏥', desc: 'Medical clinics, testing centers' },
              { name: 'Defense', icon: '🛡️', desc: 'Bunkers, guard posts, barracks' },
              { name: 'Retail', icon: '🏪', desc: 'Pop-up stores, kiosks' },
              { name: 'Agriculture', icon: '🚜', desc: 'Storage, farm offices' },
            ].map((industry, idx) => (
              <div key={idx} className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{industry.icon}</div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos - Trust Section */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-10">
            Trusted by Leading Companies Across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {['Reliance Industries', 'Tata Projects', 'L&T Construction', 'Adani Group', 'DLF Limited', 'JSW Steel'].map((company, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600 tracking-tight">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery - Enhanced with hover overlays and titles */}
      <section className="py-20 md:py-28 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Showcase</span>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold">Our Landmark Projects</h2>
            </div>
            <Link href="/products" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-blue-500 hover:text-white transition-all duration-300">
              View All Projects
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <div className="md:col-span-2 md:row-span-2 relative aspect-[4/5] md:aspect-auto overflow-hidden rounded-2xl group cursor-pointer">
              <Image
                src="/assets/images/installation.png"
                alt="Installation"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-xl md:text-2xl font-bold text-white">Industrial Installation</h3>
                <p className="text-sm text-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Large-scale prefab deployment</p>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer">
              <Image
                src="/assets/images/worker-housing.png"
                alt="Housing"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-lg font-bold text-white">Worker Housing</h3>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer">
              <Image
                src="/assets/images/hero.png"
                alt="Office"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-lg font-bold text-white">Premium Offices</h3>
              </div>
            </div>
            <div className="md:col-span-2 relative aspect-video overflow-hidden rounded-2xl group cursor-pointer">
              <Image
                src="/assets/images/factory.png"
                alt="Factory"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-xl font-bold text-white">Manufacturing Facility</h3>
                <p className="text-sm text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">State-of-the-art production</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced with card shadows and star colors */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Testimonials</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Trusted by Industry Leaders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { name: 'Aditya Mehta', role: 'Project Manager, InfraBuild', text: 'The speed of delivery was unmatched. We had a 50-man labor colony up and running in just 12 days.' },
              { name: 'Rajesh Khanna', role: 'CEO, Khanna Logistics', text: 'Saman Prefab provided a luxury office cabin that feels like a permanent building. Incredible insulation and finish.' },
              { name: 'Vikram Singh', role: 'Security Head, Global Tech Park', text: 'Our security posts have withstood heavy monsoon seasons without a single leak. The build quality is exceptional.' },
            ].map((t, i) => (
              <div key={i} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, star) => (
                    <svg key={star} width="18" height="18" fill="#F59E0B" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Locations - Enhanced with City Images */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-xs font-black text-blue-100 uppercase tracking-[0.2em] mb-4">Pan India Presence</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">We Deliver Across India</h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">Fast delivery to all major cities and industrial corridors</p>
          </div>

          {/* Featured Cities with Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 mb-8">
            {[
              {
                name: 'Mumbai',
                state: 'Maharashtra',
                img: '/assets/images/hero.png',
                alt: 'Portable Cabin Delivery in Mumbai Maharashtra - Gateway of India',
                title: 'Portable Cabins Mumbai | Prefab Office Cabins in Mumbai'
              },
              {
                name: 'Delhi NCR',
                state: 'Delhi',
                img: '/assets/images/factory.png',
                alt: 'Prefab Cabin Manufacturer in Delhi NCR - India Gate',
                title: 'Prefab Cabins Delhi NCR | Portable Offices in Delhi'
              },
              {
                name: 'Bangalore',
                state: 'Karnataka',
                img: '/assets/images/installation.png',
                alt: 'Modular Cabins in Bangalore Karnataka - Vidhana Soudha',
                title: 'Modular Cabins Bangalore | Portable Cabins in Bangalore'
              },
              {
                name: 'Hyderabad',
                state: 'Telangana',
                img: '/assets/images/worker-housing.png',
                alt: 'Prefab Cabins in Hyderabad Telangana - Charminar',
                title: 'Prefab Cabins Hyderabad | Portable Office in Hyderabad'
              },
              {
                name: 'Chennai',
                state: 'Tamil Nadu',
                img: '/assets/images/security-post.png',
                alt: 'Portable Cabins in Chennai Tamil Nadu - Marina Beach',
                title: 'Portable Cabins Chennai | Prefab Cabins in Chennai'
              },
              {
                name: 'Pune',
                state: 'Maharashtra',
                img: '/assets/images/hero.png',
                alt: 'Modular Cabins in Pune Maharashtra - Shaniwar Wada',
                title: 'Modular Cabins Pune | Portable Office Cabins in Pune'
              },
              {
                name: 'Ahmedabad',
                state: 'Gujarat',
                img: '/assets/images/factory.png',
                alt: 'Prefab Cabins in Ahmedabad Gujarat - Sabarmati Ashram',
                title: 'Prefab Cabins Ahmedabad | Portable Cabins in Gujarat'
              },
              {
                name: 'Kolkata',
                state: 'West Bengal',
                img: '/assets/images/installation.png',
                alt: 'Portable Cabins in Kolkata West Bengal - Howrah Bridge',
                title: 'Portable Cabins Kolkata | Prefab Office in Kolkata'
              },
              {
                name: 'Jaipur',
                state: 'Rajasthan',
                img: '/assets/images/worker-housing.png',
                alt: 'Modular Cabins in Jaipur Rajasthan - Hawa Mahal',
                title: 'Modular Cabins Jaipur | Portable Cabins in Rajasthan'
              },
              {
                name: 'Chandigarh',
                state: 'Punjab',
                img: '/assets/images/security-post.png',
                alt: 'Prefab Cabins in Chandigarh Punjab - Rock Garden',
                title: 'Prefab Cabins Chandigarh | Portable Office in Punjab'
              },
              {
                name: 'Indore',
                state: 'Madhya Pradesh',
                img: '/assets/images/hero.png',
                alt: 'Portable Cabins in Indore Madhya Pradesh - Rajwada Palace',
                title: 'Portable Cabins Indore | Prefab Cabins in MP'
              },
              {
                name: 'Nagpur',
                state: 'Maharashtra',
                img: '/assets/images/factory.png',
                alt: 'Modular Cabins in Nagpur Maharashtra - Deekshabhoomi',
                title: 'Modular Cabins Nagpur | Portable Office in Nagpur'
              },
            ].map((city, idx) => (
              <Link
                key={idx}
                href={`/${city.name.toLowerCase().replace(/\s+/g, '-')}/portable-cabin`}
                className="group relative block overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                title={city.title}
              >
                <div className="relative h-32 md:h-40 overflow-hidden">
                  <Image
                    src={city.img}
                    alt={city.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-bold text-white">{city.name}</h3>
                  <p className="text-xs text-blue-200">{city.state}</p>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-8 pt-6 border-t border-white/20">
            {[
              { value: '28', label: 'States Covered' },
              { value: '200+', label: 'Cities Served' },
              { value: '48hrs', label: 'Express Delivery' },
              { value: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs md:text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-4">Don't see your city? We deliver everywhere in India.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Check Your Location
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 md:mb-16 text-center">
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Got Questions?</span>
              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: 'What is the typical delivery time for a prefab cabin?', a: 'Standard portable cabins are delivered within 7-10 days. For larger projects or custom designs, delivery typically takes 2-3 weeks depending on complexity and location.' },
                { q: 'Do you provide installation services?', a: 'Yes, our expert installation team handles complete on-site setup including foundation preparation, cabin placement, and utility connections. Installation usually completes within 24-48 hours.' },
                { q: 'What materials do you use in construction?', a: 'We use industrial-grade galvanized iron (GI) frames, PUF/EPS insulated sandwich panels, weather-resistant roofing, and premium flooring materials. All materials are sourced from certified suppliers.' },
                { q: 'Can the cabins withstand extreme weather?', a: 'Absolutely. Our cabins are engineered to withstand heavy monsoons (waterproof up to 150mm/hour), high winds up to 150 km/h, and temperature ranges from -5°C to 50°C with proper insulation.' },
                { q: 'Do you offer customization options?', a: 'Yes, we offer full customization including dimensions, layout, color schemes, electrical fittings, AC provisions, windows, doors, and interior finishes. Share your requirements for a tailored solution.' },
                { q: 'What is your warranty policy?', a: 'We provide a comprehensive 5-year structural warranty and 1-year warranty on electrical and plumbing work. Extended warranty options are available for large projects.' },
              ].map((faq, idx) => (
                <details key={idx} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white pr-4">{faq.q}</h3>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center group-open:rotate-180 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section - Redesigned with Map Left, Form Right */}
      <section id="quote-section" className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="mb-12 md:mb-16 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/20 text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Get Started</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Request a Precision Quote</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Get tailored pricing for your project. Our experts will reach out within 10 minutes.</p>
          </div>

          {/* Two Column Layout */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Left Column - Contact Info & Manufacturing Units (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Manufacturing Unit 1 - Bengaluru */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Manufacturing Unit - 1
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">I, Sy No 34/2, near India Oil petrol pump</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gopasandra, Bengaluru, Karnataka 560099</p>
                    </div>
                  </div>
                  {/* Phones */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <div className="flex flex-col">
                      <a href="tel:+918861622859" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">+91 88616 22859</a>
                      <a href="tel:+918088685440" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">+91 80886 85440</a>
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </div>
                    <a href="mailto:sales@samanportable.com" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">sales@samanportable.com</a>
                  </div>
                </div>
              </div>

              {/* Manufacturing Unit 2 - Greater Noida */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Manufacturing Unit - 2
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Khata No 226, Vill-Jalpur, Bisrakh Rd</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jalpura, Dadri, Greater Noida, Uttar Pradesh 201308</p>
                    </div>
                  </div>
                  {/* Phones */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <div className="flex flex-col">
                      <a href="tel:+918796039938" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">+91 87960 39938</a>
                      <a href="tel:+919708989937" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">+91 97089 89937</a>
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </div>
                    <a href="mailto:ncr@samanportable.com" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">ncr@samanportable.com</a>
                  </div>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a href="tel:+918861622859" className="flex items-center justify-center gap-2 p-4 bg-green-600 rounded-xl text-white font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  Call Now
                </a>
                <a href="https://wa.me/918861622859" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-[#25D366] rounded-xl text-white font-semibold hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  WhatsApp
                </a>
              </div>

              {/* Working Hours */}
              <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <h3 className="font-bold text-lg">Working Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monday - Saturday</span>
                    <span className="font-semibold">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sunday</span>
                    <span className="font-semibold text-yellow-400">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/20">
                    <p className="text-xs text-gray-400">24/7 Emergency Support Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quote Form (3 columns) */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Form Header */}
                <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Get Your Quote</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fill in your requirements below</p>
                    </div>
                  </div>
                  {/* Trust badges */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      10 Min Response
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      Free Consultation
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Best Price Guarantee
                    </span>
                  </div>
                </div>
                {/* Form Content */}
                <div className="p-6 md:p-8">
                  <QuoteWizard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-28 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="mb-12 md:mb-16 text-center">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Why Choose Us</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Prefab vs Traditional</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">See why modern prefab is the smarter choice</p>
          </div>
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 p-4 md:p-6 font-bold text-sm md:text-base">
              <div className="text-gray-600 dark:text-gray-400">Factor</div>
              <div className="text-blue-600 text-center">🏗️ Prefab Cabins</div>
              <div className="text-gray-500 text-center">🏛️ Traditional</div>
            </div>
            {[
              { factor: 'Construction Time', prefab: '7-14 days', trad: '3-6 months', win: true },
              { factor: 'Cost Savings', prefab: '40-50% cheaper', trad: 'Standard pricing', win: true },
              { factor: 'Portability', prefab: '100% relocatable', trad: 'Fixed structure', win: true },
              { factor: 'Weather Dependence', prefab: 'Minimal', trad: 'High - rain delays', win: true },
              { factor: 'Quality Control', prefab: 'Factory precision', trad: 'On-site variations', win: true },
              { factor: 'Waste Generation', prefab: 'Minimal (<5%)', trad: 'High (15-20%)', win: true },
              { factor: 'Permits Required', prefab: 'Temporary permits', trad: 'Full building permits', win: true },
            ].map((row, idx) => (
              <div key={idx} className={`grid grid-cols-3 p-4 md:p-6 text-sm md:text-base border-t border-gray-100 dark:border-gray-800 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                <div className="font-medium text-gray-900 dark:text-white">{row.factor}</div>
                <div className="text-center font-semibold text-green-600">✓ {row.prefab}</div>
                <div className="text-center text-gray-500 dark:text-gray-400">{row.trad}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Quality Assurance</span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Certified Excellence</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { name: 'ISO 9001:2015', desc: 'Quality Management' },
              { name: 'ISO 14001', desc: 'Environmental Mgmt' },
              { name: 'BIS Certified', desc: 'Bureau of Indian Standards' },
              { name: 'OSHA', desc: 'Safety Standards' },
            ].map((cert, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center text-lg">🏆</div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{cert.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{cert.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Site?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Get a free consultation and detailed quote within 10 minutes. Our experts are standing by.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#quote-section" className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-600 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                Get Free Quote Now
              </Link>
              <a href="tel:+919876543210" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA - Fixed with full-width WhatsApp button */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-3.5 text-base font-bold text-white shadow-2xl shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
          Chat on WhatsApp
        </a>
      </div>
    </main>
  );
}
