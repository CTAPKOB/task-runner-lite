import { Type } from '@sinclair/typebox';
import { input, output } from '~/in-out';

const Input = Type.Object({
  id: Type.String(),
  name: Type.String(),
});

// Validated Input
const args = await input(Input);

// console.error(args);

output(args);
