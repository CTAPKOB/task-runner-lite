declare module 'node:stream' {
  function compose(
    ...streams: Array<Stream | Iterable | AsyncIterable>
  ): Duplex;
}
