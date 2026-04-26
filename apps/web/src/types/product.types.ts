import { BaseEntity } from './base.types';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export interface ProductAttribute {
  id: string;
  label: string;
  value: string;
  isFilterable?: boolean;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

export interface ProductFeatureIcon {
  type: 'icon' | 'image';
  value: string;
}

export interface ProductFeature {
  id?: string;
  title: string;
  description?: string;
  icon?: ProductFeatureIcon;
}

export interface ProductApplication {
  id?: string;
  title: string;
  description?: string;
  image?: string;
}

export interface ProductCustomButton {
  id?: string;
  label: string;
  url: string;
  type: 'link' | 'file' | 'whatsapp';
  style: 'primary' | 'secondary';
}

export interface Product extends BaseEntity {
  name: string;
  title?: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  priceMin: number;
  priceMax: number;
  priceDisplay: string | null;
  priceText?: string | null;
  status: ProductStatus;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mainImage: string | null;
  featuredImage?: string | null;
  gallery: string[] | null;
  attributes: ProductAttribute[] | null;
  features: ProductFeature[] | null;
  applications: ProductApplication[] | null;
  showFeatures: boolean;
  showApplications: boolean;
  showFaq: boolean;
  sectionOrder: string[];
  deliveryTime: string | null;
  warranty: string | null;
  installationTime: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  faqs: ProductFaq[] | null;
  customButtons: ProductCustomButton[] | null;
  featured: boolean;
}

export interface ProductListResponse {
  items: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
