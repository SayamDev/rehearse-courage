import type { Metadata } from "next";
import { MeView } from "@/components/views/me-view";

export const metadata: Metadata = {
  title: "Me - Rehearse Courage",
};

export default function MePage() {
  return <MeView />;
}
