type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = memoryCache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const value = await loader();
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function clearCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) memoryCache.delete(key);
  }
}
