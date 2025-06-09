import type { NextConfig } from "next";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
   devIndicators: false,
    images: {
    unoptimized: true,
  },
   eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint during `next build`
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
