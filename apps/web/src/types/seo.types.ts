import { BaseEntity } from './base.types';

export interface City extends BaseEntity {
  name: string;
  slug: string;
  state: string;
}

export interface CitySeoPage extends BaseEntity {
  city_id: string;
  product_category_id: string;
  slug: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  h1Override?: string;
  customBlocks?: any;
  aiGeneratedContent?: string;
  internalLinks?: { text: string; href: string }[];
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CitySeoPageListResponse {
  items: CitySeoPage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
