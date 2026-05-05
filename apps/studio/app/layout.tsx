import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RemixOS Studio",
  description: "AI-powered application studio + execution engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#05070a] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
