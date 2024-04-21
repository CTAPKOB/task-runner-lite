// import { sql } from 'drizzle-orm';

import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable(
  'queue',
  {
    id: integer('id').primaryKey(),
    script: text('name').notNull(),
    input: text('input'),
    output: text('output'),
    created_at: integer('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    running: integer('running').notNull().default(0),
  },
  (table) => {
    return {
      crated_at_running: index('name_idx').on(table.created_at, table.running),
    };
  }
);
