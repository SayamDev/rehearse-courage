import type { Metadata } from "next";
import { JourneyView } from "@/components/views/journey-view";

export const metadata: Metadata = {
  title: "Your journey - Rehearse Courage",
};

export default function JourneyPage() {
  return <JourneyView />;
}
