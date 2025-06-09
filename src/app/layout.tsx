import { cookies } from 'next/headers';
import { db } from '@/db/index';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './(admin)/layout-client';
import { SidebarProvider } from '@/context/SidebarContext'; // ✅ Import this
import { ThemeProvider } from '@/context/ThemeContext';
import { Outfit } from 'next/font/google';
import './globals.css';


const outfit = Outfit({
  subsets: ["latin"],
});
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
       <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        
        </ThemeProvider>
      </body>
    </html>
    );
  } catch (error) {
    console.error('Database query error:', error);
     redirect('https://main.brazelaorento.link');
  }
}
