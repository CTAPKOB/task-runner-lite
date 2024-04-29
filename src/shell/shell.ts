import { $, ProcessOutput } from 'zx';
import { PassThrough, compose } from 'node:stream';
import { toLines, withType } from './stream-transformers';

export const exec = (
  command: string,
  input: string | null,
  timeout: number = 60 * 10 * 1000
): AsyncIterable<
  | { type: 'stderr' | 'stdout'; line: string }
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

  compose(p$.stdout, toLines, withType('stdout')).pipe(resultStream, {
    end: false,
  });

  compose(p$.stderr, toLines, withType('stderr')).pipe(resultStream, {
    end: false,
  });

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
