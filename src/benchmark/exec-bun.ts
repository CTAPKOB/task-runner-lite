import { db } from '../db/db';
import { tasks } from '../db/schema';

import type { BatchItem } from 'drizzle-orm/batch';

const scripts = [
  (i: number) => ({
    script: 'tasks/echo-with-validation.ts',
    input: JSON.stringify({ id: `${i}`, name: `some name ${i}` }),
  }),
];

// const total = 5;
const batchSize = 50;

let counter = 0;

const arr = Array.from(
  new Array(batchSize),
  (_, i) =>
    db
      .insert(tasks)
      .values(scripts[i % scripts.length](counter * batchSize + i))
      .returning({
        id: tasks.id,
      }) as BatchItem<'sqlite'>
) as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]];

const qu = await db.batch(arr);
console.log('done', qu.length);
