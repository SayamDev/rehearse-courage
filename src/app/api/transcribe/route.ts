import { providerDeps } from "@/lib/ai/env";
import { handleTranscribe } from "@/lib/ai/handlers";

/** Speech to text for one short recording, for people aged 13 and over. The audio is not kept. See `src/lib/ai/handlers.ts`. */
export async function POST(request: Request) {
  return handleTranscribe(request, providerDeps());
}
