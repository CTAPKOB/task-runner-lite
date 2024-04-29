/**
 * Split chunks to lines
 */
export async function* toLines(source: AsyncIterable<Buffer>) {
  let reminder = '';

  for await (const chunk of source) {
    const lines = chunk.toString().split('\n');
    lines[0] = reminder + lines[0];
    reminder = lines.pop()!;

    for (const line of lines) {
      yield line;
    }
  }

  if (reminder) {
    yield reminder;
  }
}

/**
 * Add type to each line
 */
export function withType(type: 'stderr' | 'stdout') {
  return async function* (source: AsyncIterable<string>) {
    for await (const line of source) {
      yield { type, line };
    }
  };
}
