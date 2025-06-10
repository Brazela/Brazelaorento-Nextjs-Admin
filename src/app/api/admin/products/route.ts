// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { like, or, sql } from 'drizzle-orm';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  // Validate required fields
  const requiredFields = ['product_name', 'product_desc', 'price', 'category_name', 'link', 'button_name'];
  for (const field of requiredFields) {
    if (!formData.get(field)) {
      return NextResponse.json({ error: `${field.replace('_', ' ')} is required` }, { status: 400 });
    }
  }

  const file = formData.get('product_image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Product image is required' }, { status: 400 });
  }

  // Validate file
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Only JPG, PNG, GIF, and WEBP are allowed.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size exceeds 2MB limit' },
      { status: 400 }
    );
  }

  try {
    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'products',
    });

    // Insert product with just the image URL
    await db.insert(product).values({
      product_name: formData.get('product_name') as string,
      product_desc: formData.get('product_desc') as string,
      price: parseInt(formData.get('price') as string),
      category_name: formData.get('category_name') as string,
      link: formData.get('link') as string,
      button_name: formData.get('button_name') as string,
      product_image: result.secure_url, // Only storing the URL
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  const offset = (page - 1) * limit;
  
  const whereClause = search 
    ? or(
        like(product.product_name, `%${search}%`),
        like(product.category_name, `%${search}%`)
      )
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

export async function PUT(req: NextRequest) {
  
  const formData = await req.formData();
  const imageField = formData.get('product_image');

  const product_id = formData.get('product_id') as string;
  const file = formData.get('product_image') as File | null;

  // Validate required fields
  const requiredFields = ['product_name', 'product_desc', 'price', 'category_name', 'link', 'button_name'];
  for (const field of requiredFields) {
    if (!formData.get(field)) {
      return NextResponse.json({ error: `${field.replace('_', ' ')} is required` }, { status: 400 });
    }
  }

  try {
    const updateData: any = {
  product_name: formData.get('product_name') as string,
  product_desc: formData.get('product_desc') as string,
  price: parseInt(formData.get('price') as string),
  category_name: formData.get('category_name') as string,
  link: formData.get('link') as string,
  button_name: formData.get('button_name') as string,
};

// Handle image only if new file is provided
if (imageField instanceof File && imageField.size > 0) {
if (file && file.size > 0) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Only JPG, PNG, GIF, and WEBP are allowed.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size exceeds 2MB limit' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64String = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64String}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'products',
  });

  updateData.product_image = result.secure_url;
}
}else if (typeof imageField === 'string') {
  // Use existing URL
  updateData.product_image = imageField;
}


    await db.update(product)
      .set(updateData)
      .where(eq(product.product_id, Number(product_id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { product_id } = await req.json();
  
  if (!product_id) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }

  try {
    // Just delete the product record (image remains in Cloudinary)
    await db.delete(product).where(eq(product.product_id, product_id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

