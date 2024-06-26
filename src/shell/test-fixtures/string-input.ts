import { Type } from '@sinclair/typebox';
import { request, response } from '~/io';

const Input = Type.String();

const args = await request(Input);

response(args);
