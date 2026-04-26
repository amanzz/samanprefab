import { BaseEntity } from './base.types';

export interface MediaUrls {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

export interface MediaFile extends BaseEntity {
  filename: string;
  originalName: string;
  url: string;
  urls: MediaUrls;
  blurDataUrl?: string;
  altText: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  folder: string | null;
}

export interface MediaListResponse {
  items: MediaFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
