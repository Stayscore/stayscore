import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || 'stayscore',
  user: process.env.POSTGRES_USER || 'stayscore',
  password: process.env.POSTGRES_PASSWORD || 'stayscore',
});

async function run() {
  const dir = path.join(process.cwd(), 'migrations');
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = readFileSync(path.join(dir, f), 'utf-8');
    console.log('Applying', f);
    await pool.query(sql);
  }
  await pool.end();
  console.log('Migrations applied');
}
run().catch(e => { console.error(e); process.exit(1); });
