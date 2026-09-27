import { notFound } from "next/navigation";
import { UiGallery } from "./gallery";

/**
 * Internal, dev-only gallery of every UI primitive against the comps.
 * Deliberately outside NAV_ITEMS and outside all real routes; 404s in
 * production builds so it never ships as a reachable page.
 */
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiGallery />;
}
