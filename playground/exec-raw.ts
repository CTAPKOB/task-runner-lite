import { exec } from '~/shell';

const script = 'bun run ./src/task-fixtures/echo-with-validation.ts';

const input = JSON.stringify({ id: '1', name: 'some name' });

console.time('exec');
let output;

for (let i = 0; i < 100; i++) {
  for await (const line of exec(script, input)) {
    // console.log(line);
    output = line;
  }
}

console.timeEnd('exec');

console.log(output);
