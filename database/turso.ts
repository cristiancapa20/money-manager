import { createClient } from '@libsql/client/http';

const url = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL;
const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

if (!url) throw new Error('EXPO_PUBLIC_TURSO_DATABASE_URL is not set');
if (!authToken) throw new Error('EXPO_PUBLIC_TURSO_AUTH_TOKEN is not set');

export const turso = createClient({ url, authToken });
