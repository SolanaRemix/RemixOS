import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "https://remixos.app"),
  title: {
    default: "RemixOS — AI Website Builder SaaS Platform",
    template: "%s | RemixOS",
  },
  description:
    "Launch your own AI website builder SaaS in minutes. Turn plain English into professional websites. Monetize instantly with subscriptions, credits, and referrals. Multi-provider AI, blockchain-native, deploy anywhere.",
  keywords: [
    "AI website builder",
    "no-code website builder",
    "AI SaaS platform",
    "website generator AI",
    "Solana IDE",
    "Web3 development",
    "AI coding platform",
    "white-label SaaS",
    "RemixOS",
  ],
  authors: [{ name: "RemixOS Contributors" }],
  creator: "RemixOS",
  publisher: "RemixOS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RemixOS",
    title: "RemixOS — AI Website Builder SaaS Platform",
    description:
      "Turn plain English into professional websites. Launch your own AI website builder SaaS in minutes. Multi-provider AI, blockchain-native, deploy anywhere.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RemixOS — AI Website Builder SaaS Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RemixOS — AI Website Builder SaaS Platform",
    description: "Turn plain English into professional websites. Launch your own AI website builder SaaS in minutes.",
    images: ["/og-image.png"],
    creator: "@RemixOS",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
