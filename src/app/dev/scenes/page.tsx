import { notFound } from "next/navigation";
import { ScenesLab } from "./scenes-lab";

/**
 * Internal, dev-only tool for measuring stone and destination coordinates
 * on the real scene art (click the art to log an x/y percent pair). Not in
 * NAV_ITEMS, not a real route; 404s in production builds like /dev/ui.
 */
export default function DevScenesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ScenesLab />;
}
