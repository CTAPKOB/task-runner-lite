import { $ } from 'bun';

export const exec = async (command: string, input: string | null) => {
  $.nothrow();

  const res =
    input != null
      ? await $({ raw: [`${command} < `, ''] } as never, Buffer.from(input))
      : await $({ raw: [`${command}`] } as never);

  if (res.exitCode) {
    return {
      type: 'error',
      error: res.stderr.toString(),
      data: res.text(),
    };
  }

  try {
    return {
      type: 'json',
      data: res.json(),
    };
  } catch {
    return {
      type: 'text',
      data: res.text(),
    };
  }
};

/*
await exec(
  'bun run ./tasks/echo-with-validation.ts',
  JSON.stringify({
    id: '1',
    name: 'some name 1',
  })
);

await exec('bun run ./tasks/no-input.ts', null);
*/
