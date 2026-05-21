import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.EXPORT_STATIC === "true" && {
    output: "export" as const,
    distDir: "dist",
  }),
};

export default nextConfig;
