import { Buffer } from 'node:buffer';

class StableTextEncoder {
  encode(input: string): Uint8Array {
    const buffer = Buffer.from(String(input), 'utf-8');
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
}

class StableTextDecoder {
  decode(input?: ArrayBuffer | ArrayBufferView): string {
    if (!input) return '';
    const source =
      input instanceof ArrayBuffer
        ? Buffer.from(input)
        : Buffer.from(
            input.buffer,
            input.byteOffset,
            input.byteLength ?? input.buffer.byteLength
          );
    return source.toString('utf-8');
  }
}

Object.defineProperty(globalThis, 'TextEncoder', {
  value: StableTextEncoder,
  configurable: true,
  enumerable: false,
  writable: true,
});
Object.defineProperty(globalThis, 'TextDecoder', {
  value: StableTextDecoder,
  configurable: true,
  enumerable: false,
  writable: true,
});
