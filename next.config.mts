import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Next emits a warning about multiple lockfiles (a stray
  // ~/package-lock.json on this machine). Harmless. We don't pin
  // turbopack.root here because doing so via import.meta.url forces
  // ESM output and breaks the config loader. See:
  // https://nextjs.org/docs/messages/next-config-error
};

export default nextConfig;
