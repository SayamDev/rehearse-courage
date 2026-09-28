import type { Metadata } from "next";
import { ReadyView } from "@/components/views/ready-view";

export const metadata: Metadata = {
  title: "Right before - Rehearse Courage",
  description: "A one-minute warm-up for just before the real moment.",
};

/** Right before: ?s=<situation or own step id> starts on the breath, with that moment chosen. */
export default async function ReadyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { s } = await searchParams;
  return <ReadyView initial={typeof s === "string" ? s : null} />;
}
