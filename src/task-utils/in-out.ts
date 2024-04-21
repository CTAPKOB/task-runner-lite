import type { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

let res = '';

export const input = async <T extends TSchema>(
  schema?: T
): Promise<Static<T>> => {
  if (res === '') {
    for await (const line of console) {
      res += line;
    }

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

export const output = (res: unknown) => {
  console.log(JSON.stringify(res));
  process.exit(0);
};
