import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// jsdom 21 on Node 16 doesn't expose crypto.subtle globally; polyfill it.
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
} else if (typeof globalThis.crypto.subtle === 'undefined') {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: webcrypto.subtle,
    configurable: true,
    writable: true,
  });
}

// Polyfill btoa for binary strings containing bytes > 127.
// Node 16's native btoa accepts all Latin-1 chars (0-255); jsdom 21 may not.
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
