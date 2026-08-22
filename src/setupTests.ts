import { webcrypto } from 'node:crypto';

if (!window.crypto || !window.crypto.getRandomValues) {
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: webcrypto,
  });
}

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
