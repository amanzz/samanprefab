import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });

import postgres from 'postgres';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const rows = await client`SELECT key, category, label FROM settings ORDER BY category, key`;
  console.log(`\nSETTINGS IN DB (${rows.length} rows):`);
  rows.forEach((r: any) => console.log(`  [${r.category}] ${r.key} — ${r.label ?? '(no label)'}`));
  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
