export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  specifications?: Record<string, string> | null;
  images?: string[] | null;
  documents?: { label: string; url: string }[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceUnit?: string | null;
  leadTimeDays?: { min: number; max: number } | null;
  isFeatured?: boolean;
  status: 'draft' | 'published' | 'archived';
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface QuoteItem {
  id: string;
  productId?: string | null;
  productName?: string | null;
  quantity: number;
  pricePerUnit?: number | null;
  estimatedPrice?: number | null;
  specs?: Record<string, string> | null;
}

export interface Quote {
  id: string;
  refId: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'spam';
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerCity?: string | null;
  customerMessage?: string | null;
  cityId?: string | null;
  estimatedTotal?: number | null;
  notes?: string | null;
  items?: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state?: string | null;
}

export interface CitySeoPage {
  id: string;
  slug: string;
  cityId: string;
  categoryId?: string | null;
  status: 'draft' | 'published' | 'archived';
  noIndex: boolean;
  priority: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  city?: { id: string; name: string; slug: string; state?: string | null } | null;
  category?: { id: string; name: string; slug: string } | null;
}

export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
}

export interface NotFoundLog {
  id: string;
  path: string;
  count: number;
  referrer?: string | null;
  userAgent?: string | null;
  lastSeenAt: string;
  resolvedAt?: string | null;
}

export interface Setting {
  key: string;
  value: string;
  type: string;
  label: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  folder?: string | null;
  url?: string | null;
  urls?: { '300w'?: string; '800w'?: string; '1600w'?: string; original?: string } | null;
  blurDataUrl?: string | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
}
