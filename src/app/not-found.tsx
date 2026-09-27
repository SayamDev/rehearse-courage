import { House } from "@phosphor-icons/react/dist/ssr";
import { SceneArt } from "@/components/scene/scene-art";
import { ButtonLink } from "@/components/ui/button";

/** 404: a small scene, one kind line, and the way home. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] px-4 pt-10 text-center">
      <div className="relative mx-auto h-48 overflow-hidden rounded-card">
        <SceneArt room="class" className="object-top" />
      </div>
      <h1 className="mt-6 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">This path doesn&apos;t go anywhere yet.</h1>
      <ButtonLink href="/" icon={House} className="mt-6">
        Back home
      </ButtonLink>
    </div>
  );
}
