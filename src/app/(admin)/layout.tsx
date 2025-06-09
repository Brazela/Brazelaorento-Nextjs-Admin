// app/admin/layout-wrapper.tsx
import { cookies } from 'next/headers';
import { db } from '@/db/index';
import { usersTable, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './layout-client';
import { SidebarProvider } from '@/context/SidebarContext'; // ✅ Import this
import { ThemeProvider } from '@/context/ThemeContext';
import RemoveRadixPortal from '@/components/RemoveRadixPortal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin | Brazelaorento",
  description: "This is Admin Home for Brazelaorento website",
};

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (typeof sessionCookie !== 'string') {
    redirect('https://main.brazelaorento.link');
  }

  try {
    const parsed = JSON.parse(sessionCookie);
    const result = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        profilePicture: usersTable.profilePicture,
        permission: usersTable.permission,
      })
      .from(usersTable)
      .where(eq(usersTable.id, parsed.userId))
      .limit(1);

    if (result.length === 0 || !['Admin', 'Owner'].includes(result[0].permission)) {
      redirect('https://main.brazelaorento.link');
    }

   return (
  <ThemeProvider>
    <SidebarProvider>
      <RemoveRadixPortal>
        <AdminLayoutClient user={result[0]}>
          {children}
        </AdminLayoutClient>
      </RemoveRadixPortal>
    </SidebarProvider>
  </ThemeProvider>
);
  } catch (error) {
    console.error('Database query error:', error);
     redirect('https://main.brazelaorento.link');
  }
}
