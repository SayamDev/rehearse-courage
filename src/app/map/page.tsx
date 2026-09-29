import type { Metadata } from "next";
import { MapView } from "@/components/views/map-view";

export const metadata: Metadata = {
  title: "Practice areas - Rehearse Courage",
};

export default function MapPage() {
  return <MapView />;
}
