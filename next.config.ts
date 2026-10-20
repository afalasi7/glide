import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // The Android emulator reaches the dev server through 10.0.2.2.
  allowedDevOrigins: ["10.0.2.2"],
  // Serve the photography byte-for-byte; re-encoding at q75 was softening it.
  images: { unoptimized: true },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
