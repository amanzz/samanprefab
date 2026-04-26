export interface PdpCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PdpFeatureIcon {
  type: 'icon' | 'image';
  value: string;
}

export interface PdpContentItem {
  title: string;
  description?: string;
  icon?: PdpFeatureIcon;
}

export interface PdpApplicationItem {
  title: string;
  description?: string;
  image?: string;
}

export interface PdpCustomButton {
  label: string;
  url: string;
  type: 'link' | 'file' | 'whatsapp';
  style: 'primary' | 'secondary';
}

export interface PdpFaqItem {
  question: string;
  answer: string;
}

export interface PdpPrice {
  min: number | null;
  max: number | null;
  unit: string | null;
}

export interface PdpProduct {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  category: PdpCategory | null;
  description: string;
  gallery: string[];
  featuredImage: string | null;
  price: PdpPrice | null;
  priceText: string | null;
  features: PdpContentItem[];
  applications: PdpApplicationItem[];
  specifications: Record<string, string>;
  faq: PdpFaqItem[];
  showFeatures: boolean;
  showApplications: boolean;
  customButtons: PdpCustomButton[];
  showFaq: boolean;
  sectionOrder: string[];
  deliveryTime: string | null;
  warranty: string | null;
  installationTime: string | null;
  shortDescription: string | null;
}

export interface PublicSettingsMap {
  site_name?: string;
  site_url?: string;
  site_phone?: string;
  site_email?: string;
  whatsapp_number?: string;
}

export interface PublicListResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
