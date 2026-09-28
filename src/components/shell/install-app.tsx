"use client";

import { DeviceMobile } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useInstall } from "./pwa";

/**
 * "Add to your home screen": the browser's own install prompt where there
 * is one, the Share-menu steps on iPhone and iPad, nothing when already
 * installed or not possible.
 */
export function InstallApp({ className = "" }: { className?: string }) {
  const { state, install } = useInstall();
  if (state === "ready") {
    return (
      <div className={className}>
        <Button variant="secondary" icon={DeviceMobile} onClick={() => void install()}>
          Add to your home screen
        </Button>
        <p className="mt-2 text-muted">It opens like an app and works without the internet.</p>
      </div>
    );
  }
  if (state === "ios") {
    return (
      <p className={`text-ink ${className}`}>
        <strong>Add it to your home screen:</strong> tap Share, then Add to Home Screen. It opens like an app, works without the internet, and Safari
        keeps your progress for longer.
      </p>
    );
  }
  return null;
}
