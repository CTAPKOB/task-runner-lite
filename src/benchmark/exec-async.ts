import { exec } from '~/shell-zx';
import { transformer } from '~/runtime';

const script = 'bun run ./src/task-fixtures/terminated-on-break.ts';
// const script = 'bun run ./src/task-fixtures/throw.ts';

// const script = 'docker run hello-world';

for await (const line of exec(script, null, transformer)) {
  console.log(line);
  break;
}

console.log('done');
