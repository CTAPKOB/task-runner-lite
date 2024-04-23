import { request, response } from '~/runtime';
import assert from 'assert';

const args = await request();

assert(args == null, 'args should be null');

response('HELLO');
