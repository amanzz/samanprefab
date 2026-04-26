"use client";

import React, { useState } from "react";
import { useQuotes, useUpdateQuoteStatus, useUpdateQuoteNotes } from "@/hooks/useQuotes";
import { Quote, QuoteStatus } from "@/types/quote.types";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function QuotesPage() {
  const { data, isLoading, error } = useQuotes();
  const updateStatusMutation = useUpdateQuoteStatus();
  const updateNotesMutation = useUpdateQuoteNotes();

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading quote requests...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading quotes.</div>
      <p className="mt-2 text-xs text-gray-400">{(error as any)?.message}</p>
    </div>
  );

  const quotes = data?.items ?? [];

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contactPhone?.includes(searchTerm) ||
      q.refId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setAdminNotes(quote.adminNotes || "");
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (id: string, status: QuoteStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSaveNotes = () => {
    if (selectedQuote) {
      updateNotesMutation.mutate(
        { id: selectedQuote.id, adminNotes },
        { onSuccess: () => setIsDetailsOpen(false) }
      );
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is regarding your quote request at Saman Prefab. How can we help you further?`);
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Quote Requests</h2>
          <p className="text-sm text-gray-500">Track and manage incoming leads and project quotes.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search by name, phone or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Label className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-gray-400">Status:</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
          >
            <option value="all">All Quotes</option>
            {Object.values(QuoteStatus).map((status) => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Ref / Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Phone</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">City</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Est. Range</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-gray-400 uppercase leading-none mb-1">{quote.refId}</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">{quote.contactName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{quote.contactPhone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{quote.cityName || "N/A"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                      className={`rounded-lg border border-gray-200 bg-transparent py-1 px-2 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 cursor-pointer outline-none uppercase ${
                        quote.status === QuoteStatus.NEW ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" :
                        quote.status === QuoteStatus.WON ? "text-success-600 bg-success-50 dark:bg-success-500/10" :
                        quote.status === QuoteStatus.LOST ? "text-error-600 bg-error-50 dark:bg-error-500/10" :
                        quote.status === QuoteStatus.SPAM ? "text-gray-600 bg-gray-50 dark:bg-gray-500/10" :
                        "text-warning-600 bg-warning-50 dark:bg-warning-500/10"
                      }`}
                    >
                      {Object.values(QuoteStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    ₹{((quote.estimatedTotalMin || 0) / 1000).toFixed(1)}k - ₹{((quote.estimatedTotalMax || 0) / 1000).toFixed(1)}k
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openWhatsApp(quote.contactPhone, quote.contactName)}
                        className="text-success-600 hover:text-success-700 transition-colors"
                        title="Open WhatsApp"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleViewDetails(quote)}
                        className="text-brand-500 hover:text-brand-600 text-sm font-semibold"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>No quotes match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} className="max-w-2xl p-6 sm:p-8">
        {selectedQuote && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Request #{selectedQuote.refId}</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quote Details</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Received on {new Date(selectedQuote.createdAt).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Info</h4>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm dark:border-gray-800 dark:bg-gray-900">
                  <p><span className="text-gray-400">Name:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.contactName}</span></p>
                  <p><span className="text-gray-400">Email:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.contactEmail || "N/A"}</span></p>
                  <p><span className="text-gray-400">Phone:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.contactPhone}</span></p>
                  <p><span className="text-gray-400">Company:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.companyName || "N/A"}</span></p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Project Info</h4>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm dark:border-gray-800 dark:bg-gray-900">
                  <p><span className="text-gray-400">City:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.cityName || "N/A"}</span></p>
                  <p><span className="text-gray-400">Pincode:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.pincode || "N/A"}</span></p>
                  <p><span className="text-gray-400">Timeline:</span> <span className="text-gray-800 dark:text-white font-medium uppercase">{selectedQuote.timeline || "Flexible"}</span></p>
                  <p><span className="text-gray-400">Installation:</span> <span className="text-gray-800 dark:text-white font-medium">{selectedQuote.installationRequired ? "Yes" : "No"}</span></p>
                </div>
              </div>
            </div>

            {/* Quote Items */}
            {selectedQuote.items && selectedQuote.items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Requested Products</h4>
                <div className="space-y-2">
                  {selectedQuote.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{item.productName}</p>
                        {item.variantLabel && <p className="text-xs text-gray-500">{item.variantLabel}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{(item.estimatedPriceMin / 1000).toFixed(1)}k - ₹{(item.estimatedPriceMax / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedQuote.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Requirements</h4>
                <div className="rounded-xl border border-gray-100 bg-blue-50/30 p-4 text-sm italic text-gray-700 dark:border-gray-800 dark:bg-blue-500/5 dark:text-gray-300">
                  &ldquo;{selectedQuote.notes}&rdquo;
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Internal CRM Notes</h4>
              <TextArea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log communication or status updates here..."
                rows={4}
              />
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
              <Button
                variant="outline"
                onClick={() => openWhatsApp(selectedQuote.contactPhone, selectedQuote.contactName)}
                className="text-success-600 border-success-200 hover:bg-success-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Dismiss</Button>
                <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
                  {updateNotesMutation.isPending ? "Syncing..." : "Update Notes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
