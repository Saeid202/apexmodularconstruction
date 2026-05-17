import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { CmsNavigation } from "@/components/layout/CmsNavigation";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "CargoPlus - Construction Materials & Robots Marketplace",
    template: "%s | CargoPlus",
  },
  description:
    "CargoPlus is a B2C e-commerce marketplace connecting Canadian customers with Chinese sellers offering construction materials and robots. Shop quality products with secure payment and fast shipping.",
  keywords: [
    "construction materials",
    "robots",
    "e-commerce",
    "marketplace",
    "Canadian shopping",
    "building supplies",
    "automation",
    "industrial equipment",
    "CargoPlus",
  ],
  authors: [{ name: "CargoPlus" }],
  creator: "CargoPlus",
  publisher: "CargoPlus",
  metadataBase: new URL("https://cargoplus.site"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://cargoplus.site",
    siteName: "CargoPlus",
    title: "CargoPlus - Construction Materials & Robots Marketplace",
    description:
      "Shop quality construction materials and robots from trusted Chinese sellers. Secure payment in CAD, Canadian tax compliance, and fast shipping.",
    images: [
      {
        url: "https://cargoplus.site/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CargoPlus - Your Trusted Partner for Construction Success",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CargoPlus - Construction Materials & Robots Marketplace",
    description:
      "Shop quality construction materials and robots from trusted Chinese sellers.",
    images: ["https://cargoplus.site/opengraph-image"],
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
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden">
        <ServiceWorkerRegistrar />
        <ConditionalShell cmsNav={<CmsNavigation />}>
          <main className="flex-1">{children}</main>
        </ConditionalShell>
      </body>
    </html>
  );
}
