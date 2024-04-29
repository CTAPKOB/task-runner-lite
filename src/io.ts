import type { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

let res: string | null | void = undefined;

const responseId = '::bd59-6a12051544c7::';

export const safeParseResponse = (
  line: string
): { success: true; data: unknown } | { success: false } => {
  if (line.startsWith(responseId)) {
    return { success: true, data: JSON.parse(line.slice(responseId.length)) };
  }

  return { success: false };
};

export const request = async <T extends TSchema>(
  schema?: T
): Promise<Static<T>> => {
  if (res !== undefined) {
    return res;
  }

  res = process.stdin.isTTY ? null : await Bun.stdin.text();

  if (res != null) {
    try {
      res = JSON.parse(res);
    } catch {
      /* do nothing */
    }
  }

  if (schema === undefined) {
    return res;
  }

  const error = Value.Errors(schema, res).First();

  if (error == null) {
    return res;
  }

  throw `Input validation error: ${error.message} at path ${error.path} with value ${error.value}`;
};

export const response = (res: unknown) => {
  console.log(`${responseId}${JSON.stringify(res)}`);
};
