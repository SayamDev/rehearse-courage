import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { situationById } from "@/lib/content/situations";
import { StepView } from "@/components/views/step-view";

export const metadata: Metadata = {
  title: "Practice step - Rehearse Courage",
};

/**
 * A practice step. Pre-written situations are known here; a person's own
 * steps (ids starting "custom-") live only on their device, so those are
 * looked up by the client view after the store hydrates.
 */
export default async function StepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { level } = await searchParams;
  if (!situationById(id) && !id.startsWith("custom-")) notFound();
  // Keyed by level so "One more step" (same route, new ?level) starts fresh.
  return <StepView key={String(level)} id={id} levelParam={level} />;
}
