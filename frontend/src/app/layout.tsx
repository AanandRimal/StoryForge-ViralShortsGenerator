import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryForge — Viral Shorts Generator",
  description: "Create viral 60-90s vertical shorts in Nepali & Hindi with real motion footage, TTS, and auto-publishing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
