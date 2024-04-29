import { request, response } from '~/io';

const args = await request();
const args2 = await request();

response({
  result: args === args2,
});
