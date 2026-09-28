import type { Metadata } from "next";
import Link from "next/link";
import { ArtHeader } from "@/components/scene/art-header";
import { headers } from "next/headers";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { emergencyNumbers, safeReturn } from "@/lib/help";
import { supportLines } from "@/lib/safety/crisis";
import { SupportLines } from "@/components/calm/support-lines";

export const metadata: Metadata = {
  title: "Talk to someone - Rehearse Courage",
};

/**
 * "Talk to someone": support lines for the person's country, read from
 * Cloudflare's cf-ipcountry request header on the server. The country is
 * used for this response only and never stored. With ?crisis=1 (opened by
 * the on-device crisis check in a step) it starts with a gentle line and
 * a way back if it was a false alarm.
 */
export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [h, params] = await Promise.all([headers(), searchParams]);
  const { lines, emergency } = supportLines(h.get("cf-ipcountry"));
  const crisis = params.crisis === "1";
  const back = crisis ? safeReturn(params.from) : null;

  return (
    <>
      <ArtHeader title="Talk to someone" back={crisis ? undefined : { href: "/", label: "Home" }} reading />
      <div className="mx-auto max-w-[720px] px-4 pt-2 md:pt-4">

        {crisis ? (
          <p className="mt-3 text-lg text-ink">It sounds like things are really hard right now. You deserve support.</p>
        ) : null}
        <p className="mt-3 text-ink">
          These people are kind, free to contact, and used to hearing all kinds of things. You can also talk to someone
          you trust, like a parent, carer, teacher or friend.
        </p>

        <div className="mt-6">
          <SupportLines lines={lines} />
        </div>

        <p className="mt-6 rounded-card bg-surface-2 p-4 font-semibold text-ink">
          If you are in danger now, call{" "}
          {emergencyNumbers(emergency).length > 0
            ? emergencyNumbers(emergency).map((n, i) => (
                <span key={n}>
                  {i > 0 ? " or " : null}
                  <a href={`tel:${n}`} className="tabular underline">
                    {n}
                  </a>
                </span>
              ))
            : emergency}
          .
        </p>
        <p className="mt-4 text-muted">Rehearse Courage is practice, not therapy.</p>

        {back ? (
          <Link
            href={back}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-1 font-semibold text-ink underline"
          >
            Not what you meant? Carry on
            <ArrowRight size={20} weight="regular" aria-hidden />
          </Link>
        ) : null}
      </div>
    </>
  );
}
