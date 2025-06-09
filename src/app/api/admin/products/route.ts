// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  const offset = (page - 1) * limit;
  
  const whereClause = search 
    ? or(like(product.product_name, `%${search}%`), like(product.category_name, `%${search}%`))
    : undefined;

  const products = await db
    .select()
    .from(product)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
    
  const total = (await db
    .select({ count: sql<number>`count(*)` })
    .from(product)
    .where(whereClause))[0].count;
  
  return NextResponse.json({ products, total });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  await db.insert(product).values(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { product_id, ...data } = await req.json();
  await db.update(product)
    .set(data)
    .where(eq(product.product_id, product_id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { product_id } = await req.json();
  await db.delete(product).where(eq(product.product_id, product_id));
  return NextResponse.json({ success: true });
}