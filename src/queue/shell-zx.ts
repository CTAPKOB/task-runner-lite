import { $, ProcessOutput } from 'zx';
import { PassThrough, compose } from 'node:stream';

const createLineTransform = <T>(
  output: 'stderr' | 'stdout',
  transformer: (source: 'stderr' | 'stdout', line: string) => T
) =>
  async function* toLines(source: AsyncIterable<Buffer>) {
    let reminder = '';

    for await (const chunk of source) {
      const lines = chunk.toString().split('\n');
      lines[0] = reminder + lines[0];
      reminder = lines.pop()!;

      for (const line of lines) {
        yield transformer(output, line);
      }
    }

    if (reminder) {
      yield transformer(output, reminder);
    }
  };

export const exec = <T>(
  command: string,
  input: string | null,
  transformer: (output: 'stderr' | 'stdout', line: string) => T,
  timeout: number = 60 * 10 * 1000
): AsyncIterable<
  | T
  | { type: 'exit_code'; value: number | null }
  | { type: 'shell_error'; error: string }
> => {
  const p$ = $([`${command}`] as never)
    .quiet()
    .nothrow()
    .timeout(timeout);

  const resultStream = new PassThrough({ objectMode: true });

  if (input != null) {
    p$.stdin.write(input);
    p$.stdin.end();
  }

  compose(p$.stdout, createLineTransform('stdout', transformer)).pipe(
    resultStream,
    { end: false }
  );
  compose(p$.stderr, createLineTransform('stderr', transformer)).pipe(
    resultStream,
    { end: false }
  );

  let finished = false;

  p$.then((p) => {
    if (p.signal != null) {
      resultStream.write({
        type: 'shell_error',
        error: `terminated with ${p.signal}`,
      });
    }

    resultStream.write({ type: 'exit_code', value: p.exitCode });
    resultStream.end();
  })
    .catch((e: ProcessOutput) => {
      resultStream.write({ type: 'shell_error', error: e.message });
      resultStream.write({ type: 'exit_code', value: e.exitCode });
      resultStream.end();
    })
    .finally(() => {
      finished = true;
    });

  resultStream.on('close', () => {
    if (finished) {
      return;
    }

    p$.kill('SIGTERM');
  });

  return resultStream;
};
