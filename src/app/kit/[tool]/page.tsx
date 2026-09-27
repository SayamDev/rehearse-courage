import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KIT_TOOLS, kitTool } from "@/lib/content/body";
import { KitToolView } from "@/components/views/kit-tool-view";

// Only the kit's own tools exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return KIT_TOOLS.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const meta = kitTool(tool);
  return { title: meta ? `${meta.title} - Rehearse Courage` : "Rehearse Courage" };
}

export default async function KitToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const meta = kitTool(tool);
  if (!meta) notFound();
  return <KitToolView tool={meta.id} />;
}
