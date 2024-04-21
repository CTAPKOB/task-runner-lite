import { Type } from '@sinclair/typebox';
import { input, output } from '~/in-out';

const Input = Type.String();

const args = await input(Input);

output(args);
