import type { ClientDeps } from "./client";

/**
 * The real browser pieces for `client.ts`. The on-device model's code is
 * only fetched when the person has chosen to use it.
 */
export function browserAiDeps(useDevice: boolean): ClientDeps {
  return {
    fetch: (...args) => fetch(...args),
    device: useDevice ? async (system, user) => (await import("./device")).deviceGenerate(system, user) : null,
  };
}
