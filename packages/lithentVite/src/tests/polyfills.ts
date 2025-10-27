import { TextDecoder, TextEncoder } from 'node:util';

Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'TextDecoder', {
  value: TextDecoder,
  configurable: true,
  writable: true,
});

const __lithentVerifyTextEncoding = () => {
  const encoded = new TextEncoder().encode('');
  if (!(encoded instanceof Uint8Array)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor = (encoded as any).constructor as typeof Uint8Array | undefined;
    if (ctor && ctor.name === 'Uint8Array') {
      Object.defineProperty(globalThis, 'Uint8Array', {
        value: ctor,
        configurable: true,
        writable: true,
      });
    } else {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `TextEncoder polyfill failed: constructor=${(encoded as any).constructor?.name}`
      );
    }
  }
};

__lithentVerifyTextEncoding();
