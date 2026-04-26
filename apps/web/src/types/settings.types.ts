import { BaseEntity } from './base.types';

export interface Setting {
  key: string;
  value: any;
  type?: string;
  label?: string;
  category: 'general' | 'seo' | 'api' | 'email' | 'roles';
  description?: string;
  updatedAt?: string;
}
