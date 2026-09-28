import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

/**
 * A banner of scene art with the page title over the dark night sky side.
 * Kit and Badges pass their own banners (header-kit, header-badges); the
 * quiet hill from Panic now is the default.
 */
export function ArtHeader({
  title,
  line,
  art = "/art/panic.webp",
  back,
  reading = false,
}: {
  title: string;
  line?: string;
  art?: string;
  /** A back link above the title (e.g. About goes back to Me). */
  back?: { href: string; label: string };
  /** Line the title up with a 720px reading column instead of the 1100px page. */
  reading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        {/* Phones: the text spans the banner, so the scrim stays deep all the way across. */}
        <div className="absolute inset-0 md:hidden" style={{ background: "color-mix(in srgb, var(--chrome) 78%, transparent)" }} />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--chrome) 88%, transparent), color-mix(in srgb, var(--chrome) 60%, transparent) 55%, color-mix(in srgb, var(--chrome) 15%, transparent))",
          }}
        />
      </div>
      <header
        className={`relative mx-auto min-h-[28dvh] px-4 pb-10 text-on-chrome md:min-h-0 md:pb-16 ${back ? "pt-4 md:pt-8" : "pt-8 md:pt-12"} ${reading ? "max-w-[720px]" : "max-w-[1100px]"}`}
      >
        {back ? (
          <Link href={back.href} className="-ml-2 mb-1 inline-flex min-h-11 items-center gap-2 rounded-full px-2 hover:underline">
            <ArrowLeft size={22} weight="regular" aria-hidden />
            {back.label}
          </Link>
        ) : null}
        <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]">{title}</h1>
        {line ? <p className="mt-1 max-w-[36ch]">{line}</p> : null}
      </header>
    </div>
  );
}
