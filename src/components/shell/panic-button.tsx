"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Lifebuoy } from "@phosphor-icons/react";

/**
 * Opens Need a pause by adding `?calm=1` to the current path, so it works
 * from any page and the back button closes it. It lives in the top bar, in
 * the same corner on every page, in the calm blue (never the teal of progress).
 */
const CLASS =
  "flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-help/40 bg-surface px-3 font-display font-bold text-help transition-colors duration-[var(--dur-feedback)] hover:border-help hover:bg-help/10 active:bg-help/15";

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
      <Lifebuoy size={22} weight="regular" aria-hidden />
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
