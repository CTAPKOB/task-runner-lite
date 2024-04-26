import { exec } from '~/shell-zx';
import { transformer } from '~/runtime';

const script = 'bun run ./src/task-fixtures/async.ts';

for await (const line of exec(script, null, transformer)) {
  console.log(line);
}
