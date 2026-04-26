"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div 
            key={idx} 
            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-brand-500 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'}`}
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className={`text-lg font-bold ${isOpen ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                {item.question}
              </span>
              <span className={`ml-6 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </span>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
