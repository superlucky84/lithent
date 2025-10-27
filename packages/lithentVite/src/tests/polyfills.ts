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
    const ctor = encoded.constructor as typeof Uint8Array | undefined;
    if (ctor && ctor.name === 'Uint8Array') {
      Object.defineProperty(globalThis, 'Uint8Array', {
        value: ctor,
        configurable: true,
        writable: true,
      });
    } else {
      throw new Error(
        `TextEncoder polyfill failed: constructor=${encoded.constructor?.name}`
      );
    }
  }
};

__lithentVerifyTextEncoding();
