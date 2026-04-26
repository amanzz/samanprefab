"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs.length) return null;

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
              isOpen
                ? "border-brand-500 dark:border-brand-400 shadow-xl shadow-brand-500/10"
                : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-start sm:items-center justify-between p-6 text-left gap-4"
              aria-expanded={isOpen}
            >
              <div className="flex items-start gap-4 flex-1">
                <span
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isOpen
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="font-bold text-sm">{index + 1}</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug">
                  {faq.question}
                </span>
              </div>
              <span
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen
                    ? "bg-brand-500 text-white rotate-180"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6">
                  <div className="pt-4 pl-12 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
