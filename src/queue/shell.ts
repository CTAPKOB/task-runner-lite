import { $ } from 'bun';

export const exec = async (command: string, input: string | null) => {
  $.nothrow();

  const res =
    input != null
      ? await $(
          { raw: [`${command} < `, ''] } as never,
          Buffer.from(input)
        ).quiet()
      : await $({ raw: [`${command}`] } as never).quiet();

  if (res.exitCode) {
    return {
      type: 'error',
      error: res.stderr.toString().trimEnd(),
      data: res.text().trimEnd(),
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
      data: res.text().trimEnd(),
    };
  }
};
