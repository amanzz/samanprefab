"use client";

import React from "react";
import { useProducts } from "@/hooks/useProducts";
import { useQuotes } from "@/hooks/useQuotes";
import { QuoteStatus } from "@/types/quote.types";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// @ts-expect-error react-apexcharts types incompatible with React 19
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: quotesData, isLoading: quotesLoading } = useQuotes();

  const productCount = productsData?.meta?.total || 0;
  const quoteCount = quotesData?.meta?.total || 0;
  const recentQuotes = (quotesData?.items || []).slice(0, 5);
  const products = productsData?.items || [];

  const newCount = (quotesData?.items || []).filter(q => q.status === QuoteStatus.NEW).length;
  const wonCount = (quotesData?.items || []).filter(q => q.status === QuoteStatus.WON).length;
  const lostCount = (quotesData?.items || []).filter(q => q.status === QuoteStatus.LOST).length;
  const contactedCount = (quotesData?.items || []).filter(q => q.status === QuoteStatus.CONTACTED).length;

  const monthlyData = React.useMemo(() => {
    const months = Array(12).fill(0);
    (quotesData?.items || []).forEach((q) => {
      const month = new Date(q.createdAt).getMonth();
      months[month]++;
    });
    return months;
  }, [quotesData]);

  const chartOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val} leads` } },
  };

  const isLoading = productsLoading || quotesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-lg font-medium text-gray-500 dark:text-gray-300 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <MetricCard label="Total Products" value={productCount} badge="Inventory" color="brand" />
        <MetricCard label="Total Quotes" value={quoteCount} badge="All Time" color="success" />
        <MetricCard label="New Leads" value={newCount} badge="Pending" color="warning" />
        <MetricCard label="Won Deals" value={wonCount} badge="Converted" color="success" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Monthly Leads Chart */}
        <div className="col-span-12 xl:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-2 dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:pt-6">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Leads</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">Quote requests received per month</p>
            </div>
            <div className="max-w-full overflow-x-auto">
              <div className="-ml-5 min-w-[500px] xl:min-w-full pl-2">
                <ReactApexChart
                  options={chartOptions}
                  series={[{ name: "Leads", data: monthlyData }]}
                  type="bar"
                  height={220}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Status Breakdown */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Lead Pipeline</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-6">Status breakdown of all quotes</p>
            <div className="space-y-4">
              <PipelineRow label="New" count={newCount} total={quoteCount} color="bg-blue-500" />
              <PipelineRow label="Contacted" count={contactedCount} total={quoteCount} color="bg-warning-500" />
              <PipelineRow label="Won" count={wonCount} total={quoteCount} color="bg-success-500" />
              <PipelineRow label="Lost" count={lostCount} total={quoteCount} color="bg-error-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Recent Leads */}
        <div className="col-span-12 xl:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Leads</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Latest 5 quote requests</p>
              </div>
              <Link
                href="/admin/quotes"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-y border-gray-100 dark:border-gray-700">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 sm:px-6">Customer</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 sm:px-6">City</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 sm:px-6">Est. Value</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 sm:px-6">Status</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 sm:px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                      <td className="px-5 py-3 sm:px-6">
                        <p className="font-medium text-sm text-gray-800 dark:text-white">{quote.contactName}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-300">{quote.contactPhone}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">{quote.cityName || "N/A"}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 font-medium sm:px-6">
                        ₹{((quote.estimatedTotalMin || 0) / 1000).toFixed(1)}k - ₹{((quote.estimatedTotalMax || 0) / 1000).toFixed(1)}k
                      </td>
                      <td className="px-5 py-3 sm:px-6">
                        <Badge
                          size="sm"
                          color={
                            quote.status === QuoteStatus.WON ? "success" :
                            quote.status === QuoteStatus.NEW ? "warning" :
                            quote.status === QuoteStatus.LOST ? "error" : "light"
                          }
                        >
                          {quote.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentQuotes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">No quote requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Top Products</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-5">Your featured & active products</p>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  {(product.mainImage || (product.gallery && product.gallery[0])) && (
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={`http://localhost:4000${product.mainImage || (product.gallery && product.gallery[0])}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {product.priceDisplay || `₹${((product.priceMin || 0) / 1000).toFixed(1)}k - ₹${((product.priceMax || 0) / 1000).toFixed(1)}k`}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    String(product.status).toUpperCase() === "ACTIVE"
                      ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400 dark:text-success-400"
                      : "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 dark:text-warning-400"
                  }`}>
                    {product.status}
                  </span>
                </div>
              ))}
              {products.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 italic">No products yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, badge, color }: { label: string; value: number; badge: string; color: string }) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
    error: "bg-error-50 text-error-600 dark:bg-error-900/30 dark:text-error-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-300">{label}</span>
          <h4 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">{value}</h4>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorMap[color]}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function PipelineRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-3 w-full max-w-[180px]">
        <div className="relative h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div className={`absolute left-0 top-0 h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white w-8 text-right">{count}</span>
      </div>
    </div>
  );
}
