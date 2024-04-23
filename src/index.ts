import { db } from './db/db';
import { tasks } from './db/schema';
import { eq } from 'drizzle-orm/sqlite-core/expressions';
import { exec } from './queue/shell';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sleepTimeout = 100;

const TASK_CREATED = 0;
const TASK_RUNNING = 1;
const TASK_DONE = 2;
const TASK_ERROR = 3;

let counter = 0;

while (true) {
  const res = await db
    .update(tasks)
    .set({ running: TASK_RUNNING })
    .where(
      eq(
        tasks.id,
        db
          .select({ id: tasks.id })
          .from(tasks)
          .where(eq(tasks.running, TASK_CREATED))
          .orderBy(tasks.created_at)
          .limit(1)
      )
    )
    .returning({ id: tasks.id, script: tasks.script, input: tasks.input });

  counter++;

  if (counter % 100 === 0) {
    console.log('Pull counter:', counter);
  }

  if (res.length === 0) {
    await sleep(sleepTimeout);
    continue;
  }

  const { id, input, script } = res[0];

  console.log('Start', id, script, input);
  const output = await exec(script, input);
  console.log('Done', id, script, output);

  const update = await db
    .update(tasks)
    .set({
      output: JSON.stringify(output),
      running: output.type === 'error' ? TASK_ERROR : TASK_DONE,
    })
    .where(eq(tasks.id, id))
    .returning({
      id: tasks.id,
    });

  if (res.length === 0) {
    throw new Error('Failed to update');
  }

  console.log('updated', update[0].id);
}
