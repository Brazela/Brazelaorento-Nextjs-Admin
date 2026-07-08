import type { NextConfig } from "next";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  // This replaces the old webpack block for Next.js 16+
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async rewrites() {
    return [
      // Catch OpenCode API routes that the client-side JS fetches at runtime
      // and proxy them to the Hugging Face Space.
      {
        source: '/:path(provider|path|project)/:rest*',
        destination: '/api/proxy/opencode/:path/:rest*',
      },
      {
        source: '/global/:path*',
        destination: '/api/proxy/opencode/global/:path*',
      },
    ];
  },
};

export default nextConfig;
