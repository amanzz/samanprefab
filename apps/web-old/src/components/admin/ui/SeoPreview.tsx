'use client';

interface SeoPreviewProps {
  url?: string;
  title?: string;
  description?: string;
  siteUrl?: string;
}

const TITLE_LIMIT = 65;
const DESC_LIMIT = 160;

function CharCount({ value, limit }: { value: string; limit: number }) {
  const len = value.length;
  const pct = Math.min(len / limit, 1);
  const color =
    pct > 0.95 ? 'text-red-500' : pct > 0.8 ? 'text-amber-500' : 'text-gray-400';
  const barColor =
    pct > 0.95 ? 'bg-red-400' : pct > 0.8 ? 'bg-amber-400' : 'bg-green-400';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={['h-full rounded-full transition-all', barColor].join(' ')}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className={['text-xs tabular-nums', color].join(' ')}>
        {len}/{limit}
      </span>
    </div>
  );
}

export default function SeoPreview({
  url = 'https://samanprefab.com/products/your-product',
  title = '',
  description = '',
}: SeoPreviewProps) {
  const displayTitle = title.trim() || 'Page Title — Saman Prefab';
  const displayDesc =
    description.trim() ||
    'Add a meta description to control how this page appears in Google search results.';

  const truncTitle =
    displayTitle.length > TITLE_LIMIT
      ? displayTitle.slice(0, TITLE_LIMIT) + '…'
      : displayTitle;
  const truncDesc =
    displayDesc.length > DESC_LIMIT
      ? displayDesc.slice(0, DESC_LIMIT) + '…'
      : displayDesc;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-sm bg-blue-600 flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">G</span>
        </div>
        <p className="text-xs font-medium text-gray-500">Google Search Preview</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 space-y-1 shadow-sm">
        <p className="text-xs text-gray-500 truncate">{url}</p>
        <p
          className={[
            'text-base font-normal leading-snug',
            title ? 'text-blue-700' : 'text-blue-400',
          ].join(' ')}
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {truncTitle}
        </p>
        <p
          className={[
            'text-sm leading-snug',
            description ? 'text-gray-600' : 'text-gray-400',
          ].join(' ')}
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {truncDesc}
        </p>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Meta Title</p>
          </div>
          <CharCount value={title} limit={TITLE_LIMIT} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Meta Description</p>
          <CharCount value={description} limit={DESC_LIMIT} />
        </div>
      </div>
    </div>
  );
}
