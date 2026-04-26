import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from root directory
config({ path: resolve(__dirname, '../../.env') });

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
