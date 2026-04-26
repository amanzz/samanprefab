import { config } from '../../config/index';

export function generateCustomerWhatsAppLink(refId: string): string {
  const number = config.whatsapp.number;
  if (!number) return '';
  const text = encodeURIComponent(
    `Hi, I just submitted a quote request (${refId}). Can you confirm receipt?`
  );
  return `https://wa.me/91${number}?text=${text}`;
}

export function generateAdminWhatsAppLink(
  customerPhone: string,
  refId: string,
  productSummary: string
): string {
  const text = encodeURIComponent(
    `Hello, this is regarding quote ${refId} for ${productSummary}. Our team will contact you within 24 hours.`
  );
  const cleaned = customerPhone.replace(/\D/g, '');
  const e164 = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  return `https://wa.me/${e164}?text=${text}`;
}

export function buildWhatsAppTemplateMessage(params: {
  name: string;
  refId: string;
  productSummary: string;
}): string {
  return `Hello ${params.name}, your quote #${params.refId} for ${params.productSummary} has been received. Our team will contact you within 24 hours. — Saman Prefab`;
}
