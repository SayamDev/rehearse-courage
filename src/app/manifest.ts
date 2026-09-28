import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rehearse Courage: practise speaking up",
    short_name: "Courage",
    description: "Free, private practice for speaking up in class, with friends, in front of a group and out and about.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f2f6f5",
    theme_color: "#f2f6f5",
    categories: ["education", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Today's step", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Need a pause", url: "/?calm=1", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Body kit", url: "/kit", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
