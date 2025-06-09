// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  const offset = (page - 1) * limit;
  
  const whereClause = search 
    ? or(like(usersTable.username, `%${search}%`), like(usersTable.email, `%${search}%`))
    : undefined;

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      profilePicture: usersTable.profilePicture,
      permission: usersTable.permission,
    })
    .from(usersTable)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
    
  const total = (await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(whereClause))[0].count;
  
  return NextResponse.json({ users, total });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(usersTable).where(eq(usersTable.id, id));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { id, permission } = await req.json();
  await db.update(usersTable)
    .set({ permission })
    .where(eq(usersTable.id, id));
  return NextResponse.json({ success: true });
}