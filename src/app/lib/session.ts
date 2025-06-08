import { cookies } from 'next/headers';

// Simplified decryption function for session
export async function decrypt(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;
  
  try {
    const session = JSON.parse(sessionCookie);
    // Verify session structure
    if (typeof session === 'object' && session.userId) {
      return session;
    }
    return null;
  } catch (error) {
    console.error('Session decryption error:', error);
    return null;
  }
}

// Helper to get session in server components
export async function getSession() {
const cookieStore = await cookies();
const session = cookieStore.get('session')?.value;
  
  if (!session) {
    return { userId: null, username: null };
  }
  
  try {
    const parsed = JSON.parse(session);
    return {
      userId: parsed.userId || null,
      username: parsed.username || null,
      email: parsed.email || null
    };
  } catch (error) {
  console.error('Session parsing error:', error);
  return { userId: null, username: null, email: null };
}
}