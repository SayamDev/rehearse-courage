"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PauseMark } from "@/components/calm/pause-mark";

/**
 * Opens Need a pause by adding `?calm=1` to the current path, so it works
 * from any page and the back button closes it. It lives in the top bar, in
 * the same corner on every page, in the calm blue (never the teal of progress).
 */
const CLASS =
  "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--calm)_14%,var(--surface))] px-3.5 font-display font-bold text-help transition-colors duration-[var(--dur-feedback)] hover:bg-[color-mix(in_srgb,var(--calm)_22%,var(--surface))] active:bg-[color-mix(in_srgb,var(--calm)_28%,var(--surface))]";

/** The current URL plus calm=1, keeping the page's own params (e.g. a step's ?level) so nothing behind the dialog changes. */
export function calmHref(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.set("calm", "1");
  return `${pathname}?${params.toString()}`;
}

function PanicLink({ search }: { search: string }) {
  const pathname = usePathname();
  return (
    <Link href={calmHref(pathname, search)} className={CLASS}>
      <PauseMark size={22} />
      Need a pause
    </Link>
  );
}

function PanicLinkWithParams() {
  const params = useSearchParams();
  return <PanicLink search={params.toString()} />;
}

export function PanicButton() {
  // useSearchParams needs a Suspense boundary on prerendered pages; the
  // fallback is the same link without the page's own params.
  return (
    <Suspense fallback={<PanicLink search="" />}>
      <PanicLinkWithParams />
    </Suspense>
  );
}
