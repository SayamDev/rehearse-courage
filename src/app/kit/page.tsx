import type { Metadata } from "next";
import { KitView } from "@/components/views/kit-view";

export const metadata: Metadata = {
  title: "Body kit - Rehearse Courage",
};

export default function KitPage() {
  return <KitView />;
}
