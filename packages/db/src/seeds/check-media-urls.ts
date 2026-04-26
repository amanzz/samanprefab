import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });
import postgres from 'postgres';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const rows = await client`SELECT id, url, filename FROM media LIMIT 5`;
  console.log('\nMEDIA URL VALUES IN DB:');
  rows.forEach((r: any) => console.log(`  id=${r.id.slice(0,8)} | url=${r.url} | filename=${r.filename}`));
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
