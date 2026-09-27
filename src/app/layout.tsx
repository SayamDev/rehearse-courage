import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rehearse Courage",
  description: "Free, private practice for speaking up in class, with friends and in front of a group.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="px-4 py-8 text-sm">
          <p>Rehearse Courage, a Rehearse project, by Sayam Ajmal.</p>
          <p>© 2026 Sayam Ajmal. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
