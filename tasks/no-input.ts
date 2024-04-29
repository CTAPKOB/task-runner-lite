import { request, response } from '../src/io';
import assert from 'assert';

const args = await request();

assert(args == null, 'args should be null');

response('HELLO');
