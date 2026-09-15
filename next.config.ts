import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings (none yet, but future-proof)
// without needing `wrangler dev` during local development.
initOpenNextCloudflareForDev();
