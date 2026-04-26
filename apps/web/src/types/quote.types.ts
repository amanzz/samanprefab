import { BaseEntity } from './base.types';

export enum QuoteStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
  SPAM = 'spam',
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string | null;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  unit: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
}

export interface Quote extends BaseEntity {
  refId: string;
  cityId: string | null;
  cityName: string | null;
  pincode: string | null;
  deliveryAddress: string | null;
  timeline: string | null;
  installationRequired: boolean;
  notes: string | null;
  estimatedTotalMin: number;
  estimatedTotalMax: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  contactType: string;
  companyName: string | null;
  status: QuoteStatus;
  adminNotes: string | null;
  pdfUrl: string | null;
  items?: QuoteItem[];
}

export interface QuoteListResponse {
  items: Quote[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
