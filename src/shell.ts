import { $ } from 'bun';

export const exec = async (command: string, input: string | null) => {
  $.nothrow();

  const res = await $(
    { raw: [`${command} < `, ''] } as unknown as TemplateStringsArray,
    Buffer.from(input ?? '')
  ); //.quiet();

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
