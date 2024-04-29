import { sleep } from 'bun';

console.log('Hello, World!');
await sleep(100);
console.log('Hello, World!');
await sleep(100);
console.log('Hello, World!');
await sleep(1000);
const path = './not-terminated.txt';
await Bun.write(path, 'Was not terminated');
