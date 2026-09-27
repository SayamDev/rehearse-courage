import Image from "next/image";

/**
 * A banner of scene art with the page title over the dark night sky side.
 * Kit and Badges header art (header-kit, header-badges) is not made yet
 * (see design/art-manifest.md), so both use the quiet hill from Panic now
 * until it is.
 */
export function ArtHeader({ title, line, art = "/art/panic.webp" }: { title: string; line: string; art?: string }) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--chrome) 88%, transparent), color-mix(in srgb, var(--chrome) 60%, transparent) 55%, color-mix(in srgb, var(--chrome) 15%, transparent))",
          }}
        />
      </div>
      <header className="relative mx-auto max-w-[1100px] px-4 pb-10 pt-8 text-on-chrome md:pb-16 md:pt-12">
        <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]">{title}</h1>
        <p className="mt-1 max-w-[36ch]">{line}</p>
      </header>
    </div>
  );
}
