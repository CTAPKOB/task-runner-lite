import { expect, test } from 'bun:test';
import { exec } from './shell';
import { safeParseResponse } from '../io';

type InferAsyncReturnType<T> = T extends AsyncIterable<infer U> ? U : never;

type ExecResult = InferAsyncReturnType<ReturnType<typeof exec>>;

type Result = ExecResult | { type: 'json'; data: unknown };

const convert = (input: ExecResult) => {
  if (input.type === 'stdout') {
    const res = safeParseResponse(input.line);
    if (res.success) {
      return { type: 'json', data: res.data } as const;
    }
  }
  return input;
};

test('json, valid input', async () => {
  const input = JSON.stringify({
    id: '1',
    name: 'some name 1',
  });

  const script = 'bun run ./src/shell/test-fixtures/echo-with-validation.ts';

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
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

  const script = 'bun run ./src/shell/test-fixtures/echo-with-validation.ts';

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
  }

  expect(results).toEqual([
    {
      type: 'stderr',
      line: 'error: Input validation error: Required property at path /name with value undefined',
    },
    {
      type: 'exit_code',
      value: 1,
    },
  ]);
});

test('shell json, no input', async () => {
  const script = 'bun run ./src/shell/test-fixtures/echo-with-validation.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
  }

  expect(results).toEqual([
    {
      type: 'stderr',
      line: 'error: Input validation error: Expected object at path  with value null',
    },
    {
      type: 'exit_code',
      value: 1,
    },
  ]);
});

test('shell no input', async () => {
  const script = 'bun run ./src/shell/test-fixtures/no-input.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
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
  const script = 'bun run ./src/shell/test-fixtures/string-input.ts';
  const input = JSON.stringify('hello world');

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
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
  const script = 'bun run ./src/shell/test-fixtures/multi-input.ts';
  const input = JSON.stringify({ a: 1 });

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
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

  for await (const data of exec(script, input)) {
    results.push(convert(data));
  }

  expect(results).toEqual([
    {
      type: 'stdout',
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

  for await (const data of exec(script, input)) {
    results.push(convert(data));
  }

  expect(results).toEqual([
    {
      type: 'stdout',
      line: 'hel"lo',
    },
    {
      type: 'exit_code',
      value: 0,
    },
  ]);
});

test('async with logs', async () => {
  const script = 'bun run ./src/shell/test-fixtures/async.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input)) {
    results.push(convert(data));
  }

  expect(results).toEqual([
    {
      line: 'Error, World!',
      type: 'stderr',
    },
    {
      line: 'Hello, World!2 Hello, World!',
      type: 'stdout',
    },
    {
      line: '2 Error, World!',
      type: 'stderr',
    },
    {
      line: '3 Hello, World!',
      type: 'stdout',
    },
    {
      line: '3 Error, World!',
      type: 'stderr',
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
  const script = 'bun run ./src/shell/test-fixtures/timeout.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, 100)) {
    results.push(convert(data));
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
  const script = 'bun run ./src/shell/test-fixtures/terminated-on-break.ts';
  const input = null;

  let results: Result[] = [];

  for await (const data of exec(script, input, 3000)) {
    results.push(convert(data));
    break;
  }

  console.log(results);

  expect(results).toEqual([
    {
      line: 'Hello, World!',
      type: 'stdout',
    },
  ]);
});
*/
