import { NextRequest, NextResponse } from 'next/server';

const HF_SPACE_BASE = 'https://oliverch-my-opencode-agent2.hf.space';
const PROXY_PREFIX = '/api/proxy/opencode';

async function proxyHandler(
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

  const init: RequestInit & { duplex?: string } = {
    method: req.method,
    headers: {
      Authorization: authHeader,
      // forward accept header so the origin returns the right content type
      Accept: req.headers.get('accept') || '*/*',
    },
  };

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const body = await req.arrayBuffer();
    if (body.byteLength > 0) {
      init.body = body;
      init.duplex = 'half';
    }
  }

  try {
    const response = await fetch(targetUrl, init);
    const rawBody = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';

    let buffer = Buffer.from(rawBody);

    // Rewrite HTML: fix absolute paths + inject <base> tag + override fetch
    if (contentType.includes('text/html')) {
      let html = new TextDecoder().decode(rawBody);

      // Replace any full HF space URLs
      html = html.replace(
        new RegExp(HF_SPACE_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        PROXY_PREFIX,
      );

      // Rewrite root-relative asset paths: src="/assets/..." href="/..."
      // but skip ones that already point at our proxy
      html = html.replace(
        /(src|href)="\/(?!api\/proxy\/opencode)([^"]*)"/g,
        `$1="${PROXY_PREFIX}/$2"`,
      );

      // Inject a <base> tag as a fallback for any JS-driven relative fetches
      if (!html.includes('<base ')) {
        html = html.replace(
          /<head>/i,
          `<head><base href="${PROXY_PREFIX}/">`,
        );
      }

      // Inject a fetch/XHR/EventSource override so runtime API calls from OpenCode's
      // client-side JS also go through the proxy instead of hitting Next.js directly.
      const fetchOverride = `<script>
(function() {
  const PROXY = '${PROXY_PREFIX}/';
  var origin = window.location.origin;
  function proxyUrl(url) {
    if (typeof url !== 'string') return url;
    // Root-relative: /provider → /api/proxy/opencode/provider
    if (url.startsWith('/') && !url.startsWith(PROXY) && !url.startsWith('/_next/')) {
      return PROXY + url.slice(1);
    }
    // Absolute matching our origin: https://admin.brazelaorento.link/provider → proxy
    if (url.startsWith(origin + '/') && !url.startsWith(origin + PROXY)) {
      return origin + PROXY + url.slice(origin.length + 1);
    }
    return url;
  }
  var origFetch = window.fetch.bind(window);
  window.fetch = function(url, opts) { return origFetch(proxyUrl(url), opts); };
  var origXHR = window.XMLHttpRequest;
  if (origXHR) {
    var XHRProxy = function() {
      var xhr = new origXHR();
      var origOpen = xhr.open.bind(xhr);
      xhr.open = function(m, url) { return origOpen(m, proxyUrl(url)); };
      return xhr;
    };
    XHRProxy.prototype = origXHR.prototype;
    window.XMLHttpRequest = XHRProxy;
  }
  // EventSource for SSE streams (like /global/event)
  var origES = window.EventSource;
  if (origES) {
    var ESProxy = function(url, opts) {
      return new origES(proxyUrl(url), opts);
    };
    ESProxy.prototype = origES.prototype;
    window.EventSource = ESProxy;
  }
})();
<\/script>`;
      html = html.replace(
        /<base\s[^>]*\/?>/i,
        (match) => match + fetchOverride,
      );

      buffer = Buffer.from(html);
    }

    // Rewrite CSS: fix url(/assets/...) references
    if (contentType.includes('text/css')) {
      let css = new TextDecoder().decode(rawBody);
      css = css.replace(
        /url\(\/(?!api\/proxy\/opencode)/g,
        `url(${PROXY_PREFIX}/`,
      );
      buffer = Buffer.from(css);
    }

    // Rewrite JavaScript: replace any hardcoded HF Space base URL with the proxy
    // prefix so that API calls constructed in JS land also route through the proxy.
    if (contentType.includes('javascript') || contentType.includes('ecmascript')) {
      let js = new TextDecoder().decode(rawBody);
      const escaped = HF_SPACE_BASE.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
      js = js.replace(new RegExp(escaped, 'g'), PROXY_PREFIX);
      buffer = Buffer.from(js);
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy Error', { status: 502 });
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;