import type { Metadata } from "next";
import { House } from "@phosphor-icons/react/dist/ssr";
import { Companion } from "@/components/scene/companion";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found - Rehearse Courage",
};

/** 404: the firefly peeking out, one kind line, and the way home. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] px-4 pt-10 text-center">
      <div className="flex justify-center">
        <Companion species="firefly" stage="peeking" size={140} />
      </div>
      <h1 className="mt-6 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">This path doesn&apos;t go anywhere yet.</h1>
      <ButtonLink href="/" icon={House} className="mt-6">
        Back home
      </ButtonLink>
    </div>
  );
}
