import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { eq, or, like, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  const whereClause = search
    ? or(
        like(chats.chat_link, `%${search}%`),
        like(chats.requester, `%${search}%`),
        like(chats.helper, `%${search}%`)
      )
    : undefined;

  const query = db
    .select({
      chat_id: chats.chat_id,
      chat_link: chats.chat_link,
      requester: chats.requester,
      helper: chats.helper,
      generated_on: chats.generated_on,
      chat_status: chats.chat_status,
    })
    .from(chats)
    .limit(limit)
    .offset(offset);

  const chatRows = whereClause
    ? await query.where(whereClause)
    : await query;

  // Always count all rows for pagination
  const total = (await db
    .select({ count: sql<number>`count(*)` })
    .from(chats)
    .where(whereClause || undefined))[0]?.count ?? 0;

  return NextResponse.json({ chats: chatRows, total });
}

export async function DELETE(req: NextRequest) {
  const { chat_id } = await req.json();
  await db.delete(chats).where(eq(chats.chat_id, chat_id));
  return NextResponse.json({ success: true });
}