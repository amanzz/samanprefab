import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  change?: { value: number; label: string };
  loading?: boolean;
}

export function StatCard({ title, value, icon, iconBg, change, loading = false }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-4 items-start">
      <div className={['rounded-xl p-3 shrink-0', iconBg].join(' ')}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        {loading ? (
          <div className="mt-1 h-7 w-20 rounded bg-gray-200 animate-pulse" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        )}
        {change && !loading && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {change.value > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : change.value < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : (
              <Minus className="h-3 w-3 text-gray-400" />
            )}
            <span
              className={
                change.value > 0
                  ? 'text-green-600'
                  : change.value < 0
                  ? 'text-red-600'
                  : 'text-gray-400'
              }
            >
              {Math.abs(change.value)}%
            </span>
            <span className="text-gray-400">{change.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
