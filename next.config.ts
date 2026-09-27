import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // A package-lock.json above this repo (outside its git root) otherwise makes
  // Turbopack warn on every build and surface a dev-overlay "issue" badge;
  // pinning the root to this project silences that false positive.
  turbopack: {
    root: process.cwd(),
  },
  // Cross-origin isolation lets on-device voices and models use several CPU threads.
  // "credentialless" keeps plain cross-origin model downloads working.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          // Hugging Face refuses model downloads referred from workers.dev.
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
