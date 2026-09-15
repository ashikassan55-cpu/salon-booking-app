import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No R2/KV bindings needed yet — this app is almost entirely dynamic
// (every admin/auth route already forces dynamic rendering via cookies()),
// so the default cache behavior is fine without an incremental-cache
// override. Revisit if ISR-heavy static pages get added later.
export default defineCloudflareConfig();
