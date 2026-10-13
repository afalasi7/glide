import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Serve the photography byte-for-byte; re-encoding at q75 was softening it.
  images: { unoptimized: true },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
