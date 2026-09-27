import type { Metadata } from "next";
import { BadgesView } from "@/components/views/badges-view";

export const metadata: Metadata = {
  title: "Badges - Rehearse Courage",
};

export default function BadgesPage() {
  return <BadgesView />;
}
