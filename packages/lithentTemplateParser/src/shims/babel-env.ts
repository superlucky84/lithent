/**
 * Ensure minimal Node-like globals for Babel packages in browser environments.
 * Babel checks process.env for feature flags, so we provide a stub when absent.
 */
const globalObject: any = globalThis as any;

if (typeof globalObject.process === 'undefined') {
  globalObject.process = { env: {} };
} else if (typeof globalObject.process.env === 'undefined') {
  globalObject.process.env = {};
}

if (typeof globalObject.process.env.NODE_ENV === 'undefined') {
  globalObject.process.env.NODE_ENV = 'development';
}

export {};
