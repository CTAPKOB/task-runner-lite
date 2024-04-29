import { sleep } from 'bun';
import { response } from '~/runtime';

// console.info('Hello, World!');
// console.info('Hello, World!');
// console.info('Hello, World!');
// console.info('Hello, World!');
// console.info('Hello, World!');

process.stdout.write('Hello, World!'.repeat(1));
// process.stdout.write('Hello, World!');
// process.stdout.write('Hello, World!');

console.error('Error, World!');
await sleep(200);
console.info('2 Hello, World!');
console.error('2 Error, World!');
await sleep(200);
console.info('3 Hello, World!');
console.error('3 Error, World!');

response('hello');
