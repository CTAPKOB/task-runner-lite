import { resolve } from 'node:path';
import { db } from './db';
import { migrate } from 'drizzle-orm/libsql/migrator';

await migrate(db, { migrationsFolder: resolve(__dirname, '../migrations') });
