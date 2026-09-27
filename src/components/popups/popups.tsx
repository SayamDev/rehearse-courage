"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { quietPage } from "@/lib/popups";
import { SaveNudge } from "./save-nudge";
import { WelcomeGuide } from "./welcome-guide";

function PopupsInner() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const quiet = quietPage(pathname, search);
  return (
    <>
      <WelcomeGuide pathname={pathname} quiet={quiet} />
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
