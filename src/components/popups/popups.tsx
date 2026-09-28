"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { quietPage } from "@/lib/popups";
import { NameAsk } from "./name-ask";
import { SaveNudge } from "./save-nudge";
import { VoiceOffer } from "./voice-offer";
import { WelcomeGuide } from "./welcome-guide";

function PopupsInner() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const quiet = quietPage(pathname, search);
  return (
    <>
      <WelcomeGuide pathname={pathname} quiet={quiet} />
      <NameAsk pathname={pathname} quiet={quiet} />
      <VoiceOffer pathname={pathname} quiet={quiet} />
      <SaveNudge quiet={quiet} />
    </>
  );
}

/** The app's pop-ups. They take turns (one per visit) and stay away from quiet pages. */
export function Popups() {
  return (
    <Suspense fallback={null}>
      <PopupsInner />
    </Suspense>
  );
}
