"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 pb-32 bg-gray-900">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/assets/images/factory.png"
            alt="Manufacturing Facility"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-500">Since 2012</span>
            <h1 className="mt-6 text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter">
              Engineering <br />
              Infrastructure.
            </h1>
            <p className="mt-10 text-xl text-gray-300 max-w-2xl leading-relaxed">
              Saman Prefab is India's leading manufacturer of high-fidelity prefabricated structures. We combine industrial-grade materials with precision engineering to deliver spaces that move with your business.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-sm font-black text-brand-600 uppercase tracking-widest">Our Vision</span>
              <h2 className="mt-6 text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Modular Solutions for a <br /> Rapidly Growing India.
              </h2>
              <p className="mt-8 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Born out of the need for rapid industrial expansion, Saman Prefab has evolved from a small fabrication yard into a state-of-the-art manufacturing powerhouse.
              </p>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Today, we serve the country's largest infrastructure firms, delivering everything from luxury project offices to large-scale disaster relief colonies. Our mission is to redefine "temporary" into "precision-built durability."
              </p>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-black text-brand-600 tracking-tighter">5000+</p>
                  <p className="text-sm font-bold text-gray-500 uppercase mt-2">Units Delivered</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-brand-600 tracking-tighter">24+</p>
                  <p className="text-sm font-bold text-gray-500 uppercase mt-2">States Served</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 z-10">
                <Image src="/assets/images/installation.png" alt="On-site installation" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Excellence */}
      <section className="py-32 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <span className="text-sm font-black text-brand-600 uppercase tracking-widest">The Process</span>
            <h2 className="mt-6 text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Built with Precision.</h2>
            <p className="mt-6 text-gray-500 dark:text-gray-400">Our 50,000 sq.ft. facility employs advanced fabrication techniques to ensure every cabin meets ISO standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {[
              {
                title: 'Structural Integrity',
                desc: 'Every frame is computer-modeled for wind and seismic loads before fabrication.',
                icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z'
              },
              {
                title: 'Thermal Insulation',
                desc: 'We use high-density PUF panels that reduce energy consumption by up to 40%.',
                icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
              },
              {
                title: 'Corrosion Resistance',
                desc: 'All steel components undergo a multi-stage epoxy coating for longevity in coastal areas.',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 flex items-center justify-center mb-8 shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={feature.icon} /></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto rounded-[4rem] bg-brand-600 p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Image src="/assets/images/installation.png" alt="bg" fill className="object-cover" />
            </div>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none relative z-10">
              Ready for your <br /> next project?
            </h2>
            <p className="mt-10 text-xl text-white/80 max-w-2xl mx-auto relative z-10">
              Whether it's a single office or a complete industrial camp, our engineering team is ready to deliver.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link href="/#quote-section" className="w-full sm:w-auto rounded-2xl bg-white px-10 py-5 text-lg font-black text-brand-600 hover:bg-gray-100 transition-all shadow-xl">
                Request Quote
              </Link>
              <Link href="/contact" className="w-full sm:w-auto rounded-2xl bg-brand-700/50 border border-white/20 px-10 py-5 text-lg font-black text-white backdrop-blur-md hover:bg-brand-700/70 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
