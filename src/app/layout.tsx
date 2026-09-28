import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rehearse Courage",
  description: "Free, private practice for speaking up in class, with friends, in front of a group and out and about.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1b1e" },
  ],
};

// Reads settings straight out of localStorage and applies them to <html> before
// the browser paints, so a saved dark theme, reduced motion or large text never
// flashes wrong on load. Kept intentionally tiny and never throws; SettingsEffects
// is the live updater once React hydrates. See node_modules/next/dist/docs/
// 01-app/02-guides/preventing-flash-before-hydration.md.
const SETTINGS_SCRIPT = `(function(){try{var r=JSON.parse(localStorage.getItem("courage:v1"));var s=r&&r.settings;if(!s)return;var d=document.documentElement;if(s.theme==="light"||s.theme==="dark")d.setAttribute("data-theme",s.theme);if(s.reduceMotion)d.setAttribute("data-motion","reduce");if(s.textSize==="large"||s.textSize==="larger")d.setAttribute("data-text",s.textSize);else if(s.largeText)d.setAttribute("data-text","large")}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${atkinson.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SETTINGS_SCRIPT }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
