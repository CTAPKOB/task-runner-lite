import { request, response } from '~/runtime';

const args = await request();
const args2 = await request();

response({
  result: args === args2,
});
