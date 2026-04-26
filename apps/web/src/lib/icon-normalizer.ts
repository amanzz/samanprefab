import type { PdpFeatureIcon } from '@/types/pdp-product.types';

/**
 * Normalizes icon data from the CMS.
 * Backend may return: icon: string (URL or icon name)
 * or icon: { type: "image" | "icon", value: string }
 *
 * If string starts with "/" or "http" → image type
 * Otherwise → icon type (lucide/feature-icons name)
 */
export function normalizeIcon(icon?: string | PdpFeatureIcon | null): PdpFeatureIcon | null {
  if (!icon) return null;

  if (typeof icon === 'object' && 'type' in icon && 'value' in icon) {
    return icon as PdpFeatureIcon;
  }

  if (typeof icon === 'string') {
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return { type: 'image', value: icon };
    }
    return { type: 'icon', value: icon };
  }

  return null;
}
