import { sleep, stdout } from 'bun';

const wrt = stdout.writer();

for (let i = 0; i < 125; i++) {
  await wrt.write(`Hello, world! ${i}\n`);
  await wrt.flush();
  await sleep(200);
}
