import { exec } from '~/shell';

const script = 'bun run ./src/task-fixtures/terminated-on-break.ts';
// const script = 'bun run ./src/task-fixtures/throw.ts';

// const script = 'docker run hello-world';

for await (const line of exec(script, null)) {
  console.log(line);
  break;
}

console.log('done');
