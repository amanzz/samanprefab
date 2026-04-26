"use client";

import React from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-brand-600/5 blur-3xl -z-10 pointer-events-none" />

      <div className="pt-16 md:pt-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

            <div className="space-y-16">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600">Contact Engineering</span>
                <h1 className="mt-8 text-5xl font-black text-gray-900 dark:text-white md:text-8xl tracking-tighter leading-[0.9]">
                  Let's <br /> Build <br /> <span className="text-brand-600">Together.</span>
                </h1>
                <p className="mt-10 text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                  Have a complex infrastructure requirement? Our engineers are ready to design a custom solution for your site.
                </p>
              </div>

              <div className="space-y-10">
                {[
                  { label: 'Headquarters', value: 'Surat, Gujarat, India', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                  { label: 'Technical Sales', value: '+91 98765 43210', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                  { label: 'Support Email', value: 'sales@samanprefab.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 text-brand-600 shadow-xl border border-gray-50 dark:border-gray-700 transition-transform group-hover:scale-110">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={item.icon} /></svg>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{item.label}</h4>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-6">
                  <a href="https://wa.me/919876543210" className="inline-flex items-center gap-4 rounded-3xl bg-green-500 px-10 py-5 text-lg font-black text-white shadow-2xl shadow-green-500/20 hover:bg-green-600 transition-all">
                    WhatsApp Chat
                    <span className="animate-pulse">●</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-brand-600/10 blur-2xl rounded-[4rem] pointer-events-none" />
              <div className="relative rounded-[4rem] bg-white dark:bg-gray-800 p-10 md:p-16 shadow-2xl border border-gray-100 dark:border-gray-700">
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                      <Input placeholder="John Doe" className="h-14 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 focus:border-brand-600" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Name</Label>
                      <Input placeholder="Acme Corp" className="h-14 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 focus:border-brand-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</Label>
                    <Input type="email" placeholder="john@example.com" className="h-14 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 focus:border-brand-600" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</Label>
                    <Input placeholder="+91 00000 00000" className="h-14 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 focus:border-brand-600" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Project Details</Label>
                    <TextArea placeholder="Tell us about your project requirements..." rows={5} className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 focus:border-brand-600 p-4" />
                  </div>
                  <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-brand-600/30 bg-brand-600 hover:bg-brand-700 transition-all uppercase tracking-widest">
                    Submit Inquiry
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
