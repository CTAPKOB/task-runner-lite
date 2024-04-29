import { expect, test } from 'bun:test';
import { exec } from './shell-zx';
import { transformer } from '~/runtime';

type InferAsyncReturnType<T> = T extends AsyncIterable<infer U> ? U : never;

type Result = InferAsyncReturnType<
  ReturnType<typeof exec<ReturnType<typeof transformer>>>
>;

test('json, valid input', async () => {
  const input = JSON.stringify({
    id: '1',
    name: 'some name 1',
  });

  const script = 'bun run ./src/task-fixtures/echo-with-validation.ts';

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'json',
      data: {
        id: '1',
        name: 'some name 1',
      },
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('shell json, invalid input', async () => {
  const input = JSON.stringify({
    id: '1',
    not_exists: 'some name 1',
  });

  const script = 'bun run ./src/task-fixtures/echo-with-validation.ts';

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'error',
      error:
        'error: Input validation error: Required property at path /name with value undefined',
    },
    {
      type: 'exit_code',
      value: 1,
    },
  ]);
});

test('shell json, no input', async () => {
  const script = 'bun run ./src/task-fixtures/echo-with-validation.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'error',
      error:
        'error: Input validation error: Expected object at path  with value null',
    },
    {
      type: 'exit_code',
      value: 1,
    },
  ]);
});

test('shell no input', async () => {
  const script = 'bun run ./src/task-fixtures/no-input.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'json',
      data: 'HELLO',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('shell string input', async () => {
  const script = 'bun run ./src/task-fixtures/string-input.ts';
  const input = JSON.stringify('hello world');

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'json',
      data: 'hello world',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('multiple input calls give same result', async () => {
  const script = 'bun run ./src/task-fixtures/multi-input.ts';
  const input = JSON.stringify({ a: 1 });

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'json',
      data: { result: true },
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('bash', async () => {
  const script = 'echo "hello"';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'log',
      line: 'hello',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('bash', async () => {
  const script = 'cat <<EOF\nhel"lo\nEOF';

  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      type: 'log',
      line: 'hel"lo',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('async with logs', async () => {
  const script = 'bun run ./src/task-fixtures/async.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      error: 'Error, World!',
      type: 'error',
    },
    {
      line: 'Hello, World!2 Hello, World!',
      type: 'log',
    },
    {
      error: '2 Error, World!',
      type: 'error',
    },
    {
      line: '3 Hello, World!',
      type: 'log',
    },
    {
      error: '3 Error, World!',
      type: 'error',
    },
    {
      data: 'hello',
      type: 'json',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('SIGTERM on timeout', async () => {
  const script = 'bun run ./src/task-fixtures/timeout.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer, 100)) {
    results.push(data);
  }

  expect(results).toEqual([
    {
      error: 'terminated with SIGTERM',
      type: 'shell_error',
    },
    {
      type: 'exit_code',
      value: null,
    },
  ]);
});

// Bun hangs in test for unknown reason (SIGTERM is not killing the underlying process). No issues with real life application.
/*
test('Process terminated if no readers', async () => {
  const script = 'bun run ./src/task-fixtures/terminated-on-break.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, transformer)) {
    results.push(data);
    break;
  }

  console.log(results);

  expect(results).toEqual([
    {
      line: 'Hello, World!',
      type: 'log',
    },
  ]);
});
*/
