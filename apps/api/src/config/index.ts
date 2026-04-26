export const config = {
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  host: process.env.API_HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  email: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@samanprefab.com',
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@samanprefab.com',
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  },
  crm: {
    webhookUrl: process.env.CRM_WEBHOOK_URL ?? '',
    webhookSecret: process.env.CRM_WEBHOOK_SECRET ?? '',
  },
  cdn: {
    baseUrl: process.env.CDN_BASE_URL ?? '',
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER ?? '',
  },
  internal: {
    apiSecret: process.env.INTERNAL_API_SECRET ?? 'change-this-internal-secret',
  },
  site: {
    url: process.env.SITE_URL ?? 'https://samanprefab.com',
    name: process.env.SITE_NAME ?? 'Saman Prefab',
  },
};
