async function* foo() {
  yield 2;
}

for await (const num of foo()) {
  console.log(num);
  // Expected output: 1
}
