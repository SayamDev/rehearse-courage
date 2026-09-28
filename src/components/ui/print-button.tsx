"use client";

import { Printer } from "@phosphor-icons/react";
import { Button } from "./button";

/** Opens the browser's print dialog (or Save as PDF). Hidden on the printed page itself. */
export function PrintButton({ children = "Print this guide" }: { children?: string }) {
  return (
    <Button variant="secondary" icon={Printer} onClick={() => window.print()} data-no-print>
      {children}
    </Button>
  );
}
