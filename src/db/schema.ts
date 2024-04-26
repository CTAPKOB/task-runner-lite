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
      created_at_running: index('created_at_name_idx').on(
        table.created_at,
        table.running
      ),
      running_at_created: index('name_created_at_idx').on(
        table.running,
        table.created_at
      ),
    };
  }
);
