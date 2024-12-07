import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  dialect: 'postgresql',
  tablesFilter: ["dms_*"],
} satisfies Config;