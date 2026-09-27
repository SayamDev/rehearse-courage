"use client";

import { useState } from "react";
import { Microphone } from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";
import { Button, ButtonLink } from "@/components/ui/button";
import { IdeaList } from "@/components/ui/idea-list";
import { PaperCard } from "@/components/ui/paper-card";
import { StatsPill } from "@/components/ui/stats-pill";
import { Sticker } from "@/components/ui/sticker";
import { Switch } from "@/components/ui/switch";
import { ToolTile } from "@/components/ui/tool-tile";

const IDEAS = ["I'm having a rough day", "I'm not sure", "I'd like to pass", "I think it's..."];

const KIT_TILES = [
  { href: "/kit/breathing", art: "/art/kit/breathing.webp", title: "Breathing", line: "Calm your mind and slow your body.", helps: "Helps with rising anxiety" },
  { href: "/kit/grounding", art: "/art/kit/grounding.webp", title: "Grounding", line: "Get back to the present moment.", helps: "Helps when you feel lost" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-line pb-10">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function UiGallery() {
  const [switchOn, setSwitchOn] = useState(true);
  const [idea, setIdea] = useState<string | null>(IDEAS[0]);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  function setDataTheme(next: "system" | "light" | "dark") {
    setTheme(next);
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">UI primitives</h1>
        <p className="text-muted">Dev-only gallery. Not in nav, not built in production.</p>
        <div className="flex gap-2">
          {(["system", "light", "dark"] as const).map((t) => (
            <Button key={t} variant={theme === t ? "primary" : "secondary"} size="md" onClick={() => setDataTheme(t)}>
              {t}
            </Button>
          ))}
        </div>
      </header>

      <Section title="PaperCard">
        <PaperCard className="max-w-md">
          <p className="text-sm text-muted">Today&apos;s one step</p>
          <h3 className="font-display text-2xl font-bold text-ink">Answer a question in class</h3>
          <p className="mt-2 text-sm text-muted">Step 3 of 6</p>
          <p className="text-ink">Say it out loud, alone.</p>
          <Button className="mt-4">Start</Button>
        </PaperCard>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg">Start</Button>
          <Button variant="secondary" size="lg">Type instead</Button>
          <Button variant="chrome" size="lg" icon={Microphone}>Hold to speak</Button>
          <Button variant="primary" size="md">Small</Button>
          <Button variant="primary" size="lg" disabled>Disabled</Button>
          <ButtonLink variant="secondary" size="md" href="/">Link button</ButtonLink>
        </div>
      </Section>

      <Section title="StatsPill">
        <StatsPill braveDays={3} points={145} />
        <StatsPill braveDays={1} points={1} />
      </Section>

      <Section title="Switch">
        <div className="max-w-xs">
          <Switch checked={switchOn} onChange={setSwitchOn} label="Reduce motion" />
          <Switch checked={false} onChange={() => {}} label="Disabled option" disabled />
        </div>
      </Section>

      <Section title="Sticker">
        <div className="flex flex-wrap gap-4">
          {BADGES.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-2">
              <Sticker badgeId={b.id} earned />
              <Sticker badgeId={b.id} earned={false} />
              <span className="max-w-[6rem] text-center text-xs text-muted">{b.title}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="ToolTile">
        <div className="grid gap-3 sm:grid-cols-2">
          {KIT_TILES.map((t) => (
            <ToolTile key={t.href} {...t} />
          ))}
        </div>
      </Section>

      <Section title="IdeaList">
        <PaperCard className="max-w-md">
          <IdeaList ideas={IDEAS} value={idea} onChange={setIdea} />
        </PaperCard>
      </Section>
    </div>
  );
}
