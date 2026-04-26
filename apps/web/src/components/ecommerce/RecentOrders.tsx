"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useQuotes } from "@/hooks/useQuotes";
import { QuoteStatus } from "@/types/quote.types";

export default function RecentOrders() {
  const { data, isLoading } = useQuotes({ limit: 5 });
  const recentQuotes = data?.items || [];

  if (isLoading) return <div className="p-6 text-center animate-pulse">Loading recent requests...</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Quote Requests
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <a href="/admin/quotes" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </a>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Est. Value
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {quote.contactName}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {quote.contactPhone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  ₹{(quote.estimatedTotalMin / 1000).toFixed(1)}k - ₹{(quote.estimatedTotalMax / 1000).toFixed(1)}k
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      quote.status === QuoteStatus.WON
                        ? "success"
                        : quote.status === QuoteStatus.NEW
                        ? "warning"
                        : quote.status === QuoteStatus.LOST
                        ? "error"
                        : "light"
                    }
                  >
                    {quote.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {recentQuotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-gray-400">
                  No recent quote requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
