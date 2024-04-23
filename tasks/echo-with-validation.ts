import { Type } from '@sinclair/typebox';
import { request, response } from '~/runtime';

const Input = Type.Object({
  id: Type.String(),
  name: Type.String(),
});

// Validated Input
const args = await request(Input);

response(args);
