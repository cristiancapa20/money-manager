/**
 * Cache simple de lecturas en AsyncStorage para soportar modo offline.
 * Guarda la ultima lista conocida por (usuario, entidad) y permite leerla
 * cuando Turso no esta disponible.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type CachedEntity =
  | 'cards'
  | 'transactions'
  | 'categories'
  | 'loans'
  | 'subscriptions';

function key(entity: CachedEntity, userId: string): string {
  return `costos_cache_${entity}_${userId}`;
}

export async function readCache<T>(
  entity: CachedEntity,
  userId: string,
): Promise<T[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key(entity, userId));
    if (!raw) return null;
    return JSON.parse(raw) as T[];
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  entity: CachedEntity,
  userId: string,
  data: T[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(key(entity, userId), JSON.stringify(data));
  } catch {
    // cache fallido no debe romper flujo principal
  }
}

/**
 * Helper: intenta una lectura remota y la cachea; si falla, retorna el cache.
 * Si tampoco hay cache, re-lanza el error original.
 */
export async function readWithCache<T>(
  entity: CachedEntity,
  userId: string,
  remote: () => Promise<T[]>,
): Promise<T[]> {
  try {
    const data = await remote();
    writeCache(entity, userId, data).catch(() => {});
    return data;
  } catch (err) {
    const cached = await readCache<T>(entity, userId);
    if (cached) return cached;
    throw err;
  }
}

export async function clearCache(userId: string): Promise<void> {
  const entities: CachedEntity[] = [
    'cards',
    'transactions',
    'categories',
    'loans',
    'subscriptions',
  ];
  await Promise.all(entities.map((e) => AsyncStorage.removeItem(key(e, userId))));
}
