import { NextResponse } from 'next/server';
import { sendCustomEmail } from '@/utils/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fromName = formData.get('fromName') as string;
    const fromEmail = formData.get('fromEmail') as string;
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const closing = formData.get('closing') as string;
    const signature = formData.get('signature') as string;
    const why = formData.get('why') as string;
    const blocksRaw = formData.get('blocks') as string;
    let blocks: { type: 'text' | 'image' | 'button'; value: string; link?: string }[] = []; 
    try {
      blocks = JSON.parse(blocksRaw);
    } catch {}

    await sendCustomEmail({
      fromName,
      fromEmail,
      to,
      subject,
      closing,
      signature,
      why,
      blocks,
      formData,
    });

    return NextResponse.json({ message: 'Email sent.' }, { status: 200 });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
