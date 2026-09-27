import { providerDeps } from "@/lib/ai/env";
import { handleCoach } from "@/lib/ai/handlers";

/** Cobi's reply to one practice answer, for people aged 13 and over. See `src/lib/ai/handlers.ts`. */
export async function POST(request: Request) {
  return handleCoach(request, providerDeps());
}
