import type { Metadata } from "next";
import { FirstVisit } from "@/components/views/first-visit";

export const metadata: Metadata = {
  title: "Get started - Rehearse Courage",
};

export default function StartPage() {
  return <FirstVisit />;
}
