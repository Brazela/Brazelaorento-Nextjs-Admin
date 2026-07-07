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
};

export default nextConfig;
