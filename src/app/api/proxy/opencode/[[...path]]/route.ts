import { NextRequest, NextResponse } from 'next/server';

const HF_SPACE_BASE = 'https://oliverch-my-opencode-agent2.hf.space';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  const username = process.env.OPENCODE_SERVER_USERNAME || 'opencode';
  const password = process.env.OPENCODE_SERVER_PASSWORD || '';

  const targetPath = path ? path.join('/') : '';
  const queryString = req.nextUrl.searchParams.toString();
  const targetUrl = `${HF_SPACE_BASE}/${targetPath}${queryString ? `?${queryString}` : ''}`;

  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: authHeader,
        'User-Agent': req.headers.get('user-agent') || 'NextJS-Proxy',
      },
    });

    const body = await response.arrayBuffer();
    let contentType = response.headers.get('content-type') || '';

    // Rewrite absolute URLs in HTML responses so assets point back to the proxy
    let buffer = Buffer.from(body);
    if (contentType.includes('text/html')) {
      let html = new TextDecoder().decode(body);
      // Rewrite the HF space base URL to the proxy path
      html = html.replace(
        new RegExp(HF_SPACE_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        '/api/proxy/opencode',
      );
      buffer = Buffer.from(html);
    }

    return new NextResponse(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy Error', { status: 502 });
  }
}
