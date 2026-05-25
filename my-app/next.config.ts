import type { NextConfig } from "next";
import path from "path";

const isStatic = process.env.EXPORT_STATIC === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ensure @ alias works correctly
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
  turbopack: {},
  ...(isStatic && {
    output: "export" as const,
    distDir: "dist",
  }),
};

export default nextConfig;
