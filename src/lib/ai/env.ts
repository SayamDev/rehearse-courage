import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AiBinding } from "@/lib/safety/output";
import { limits } from "./limits";
import type { ProviderDeps } from "./provider";

/**
 * The providers this Worker can use right now. The Workers AI binding only
 * exists on Cloudflare; in `next dev` and tests it is missing and the chain
 * simply skips it. The Groq key comes from `wrangler secret put GROQ_API_KEY`.
 */
export function providerDeps(): ProviderDeps {
  let ai: AiBinding | null = null;
  try {
    ai = (getCloudflareContext().env as { AI?: AiBinding }).AI ?? null;
  } catch {
    ai = null;
  }
  const key = process.env.GROQ_API_KEY;
  return { groq: key ? { key, fetch: (...args) => fetch(...args) } : null, ai, limits };
}
