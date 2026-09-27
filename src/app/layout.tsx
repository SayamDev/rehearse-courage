import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";
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
  description: "Free, private practice for speaking up in class, with friends and in front of a group.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4e6cf" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2231" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${atkinson.variable}`}>
      <body>
        {children}
        <footer className="px-4 py-8 text-sm text-muted">
          <p>Rehearse Courage, a Rehearse project, by Sayam Ajmal.</p>
          <p>© 2026 Sayam Ajmal. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
