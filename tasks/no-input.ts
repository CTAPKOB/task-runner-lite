import { input, output } from '~/in-out';
import assert from 'assert';

const args = await input();

assert(args == null, 'args should be null');

output('HELLO');
