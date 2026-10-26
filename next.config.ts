import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // Next 16 defaults agentUpgrade to 'security', which aborts the FIRST build
  // with SecurityFatalError so it can show the upgrade nudge — a container
  // build cannot "retry", so opt out to keep Docker builds deterministic.
  // This silences the nudge only; it does not fix the vulnerability.
  experimental: { agentUpgrade: false },
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
