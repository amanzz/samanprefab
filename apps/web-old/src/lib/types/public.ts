// Public-facing types (shared with API where needed)

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceUnit: string;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  specifications?: Record<string, string>;
  leadTimeDays?: { min: number; max: number } | null;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
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
  metaTitle?: string | null;
  metaDescription?: string | null;
  priority: number;
  noIndex: boolean;
  city?: City | null;
  category?: ProductCategory | null;
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  city?: string;
  productInterest?: string;
  quantity?: number;
  requirements?: string;
  budget?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  location: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  author?: {
    name: string;
    image?: string;
  };
  tags: string[];
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  sitePhone: string;
  siteEmail: string;
  whatsappNumber: string;
  gtmId?: string;
}
