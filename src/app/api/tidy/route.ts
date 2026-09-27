import { providerDeps } from "@/lib/ai/env";
import { handleTidy } from "@/lib/ai/handlers";

/** Turns a messy sentence into a tidy one, for people aged 13 and over. See `src/lib/ai/handlers.ts`. */
export async function POST(request: Request) {
  return handleTidy(request, providerDeps());
}
