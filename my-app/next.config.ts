import type { NextConfig } from "next";
import path from "path";

const isStatic = process.env.EXPORT_STATIC === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
