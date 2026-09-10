import "server-only";

export const TTL_MS = 60_000;

const cache = (globalThis.__catalogue ??= { promise: null, expiresAt: 0 });

export const readCache = () =>
  cache.promise && cache.expiresAt > Date.now() ? cache.promise : null;

export const primeCache = (promise) => {
  cache.promise = promise;
  cache.expiresAt = Date.now() + TTL_MS;

  return promise;
};

export const dropCache = () => {
  cache.promise = null;
  cache.expiresAt = 0;
};

export const invalidateCatalogue = () => {
  cache.expiresAt = 0;
};
