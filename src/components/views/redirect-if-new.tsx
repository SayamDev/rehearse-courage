"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourage } from "@/lib/store";

/**
 * Sends a first-time visitor (no companion chosen yet) to /start, once
 * localStorage has been read. Returning users (companion already set) stay
 * on Home. Renders nothing.
 */
export function RedirectIfNew() {
  const { hydrated, companion } = useCourage();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !companion) {
      router.replace("/start");
    }
  }, [hydrated, companion, router]);

  return null;
}
