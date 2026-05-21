import type { NextConfig } from "next";

const isStatic = process.env.EXPORT_STATIC === "true";

const nextConfig: NextConfig = {
  ...(isStatic && {
    output: "export" as const,
    distDir: "dist",
  }),
};

export default nextConfig;
