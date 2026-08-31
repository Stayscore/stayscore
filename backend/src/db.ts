// backend/src/db.ts
import { Pool } from 'pg';

// Bevorzugt: eine komplette Connection-String in DATABASE_URL (z.B. von neon.tech).
// Alternativ: die einzelnen POSTGRES_*-Felder.
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });
