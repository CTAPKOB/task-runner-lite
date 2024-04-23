import { expect, test } from 'bun:test';
import { exec } from './shell';

test('json, valid input', async () => {
  const input = {
    id: '1',
    name: 'some name 1',
  };

  const res = await exec(
    'bun run ./src/task-fixtures/echo-with-validation.ts',
    JSON.stringify(input)
  );

  expect(res.data).toEqual({
    id: '1',
    name: 'some name 1',
  });
});

test('shell json, invalid input', async () => {
  const input = {
    id: '1',
    not_exists: 'some name 1',
  };

  const res = await exec(
    'bun run ./src/task-fixtures/echo-with-validation.ts',
    JSON.stringify(input)
  );

  expect(res.type).toEqual('error');
});

test('shell json, no input', async () => {
  const res = await exec(
    'bun run ./src/task-fixtures/echo-with-validation.ts',
    null
  );

  expect(res.type).toEqual('error');
});

test('shell no input', async () => {
  const res = await exec('bun run ./src/task-fixtures/no-input.ts', null);

  expect(res.data).toEqual('HELLO');
});

test('shell string input', async () => {
  const res = await exec(
    'bun run ./src/task-fixtures/string-input.ts',
    'world'
  );
  expect(res.data).toEqual('world');
});

test('bash', async () => {
  const res = await exec('echo "hello"', null);
  expect(res.data).toEqual('hello');
});

test('bash', async () => {
  const res = await exec(`bash -c "cat <<EOF\nhel\\"ldddo\nEOF"`, null);

  console.log('EEE', res);
});
