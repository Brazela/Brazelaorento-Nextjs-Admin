// lib/auth.ts
import { cookies } from 'next/headers';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
// lib/auth.ts
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) return null;

  const rawUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(userId)))
    .then((res) => res[0]);

  if (!rawUser) return null;

  return {
    id: rawUser.id,
    username: rawUser.username,
    email: rawUser.email,
    profilePicture: rawUser.profilePicture,
    permission: rawUser.permission,
    verificationCode: rawUser.verificationCode ?? undefined,
    resetPassCode: rawUser.resetPassCode ?? undefined,
  };
}
