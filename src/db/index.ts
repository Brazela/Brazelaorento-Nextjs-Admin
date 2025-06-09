import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';

// Use Next.js environment variables directly
const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  
  throw new Error('TURSO_CONNECTION_URL is not set');
}

if (!authToken) {
  throw new Error('TURSO_AUTH_TOKEN is not set');
}

// Use HTTP client instead of WebSocket-based client
const client = createClient({
  url,
  authToken,
  
});

if (process.env.NODE_ENV === 'development') {
  console.log('Turso database connected successfully');
}

export const db = drizzle(client);