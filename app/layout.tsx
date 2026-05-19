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
    default: "Apex Modular Construction - Prefabricated Homes & Materials Marketplace",
    template: "%s | Apex Modular Construction",
  },
  description:
    "Apex Modular Construction is a B2C e-commerce marketplace connecting Canadian customers with Chinese sellers offering prefabricated modular homes and construction materials. Shop quality products with secure payment and fast shipping.",
  keywords: [
    "construction materials",
    "robots",
    "e-commerce",
    "marketplace",
    "Canadian shopping",
    "building supplies",
    "automation",
    "industrial equipment",
    "Apex Modular Construction",
  ],
  authors: [{ name: "Apex Modular Construction" }],
  creator: "Apex Modular Construction",
  publisher: "Apex Modular Construction",
  metadataBase: new URL("https://apexmodularconstruction.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://apexmodularconstruction.com",
    siteName: "Apex Modular Construction",
    title: "Apex Modular Construction - Prefabricated Homes & Materials Marketplace",
    description:
      "Shop quality construction materials and robots from trusted Chinese sellers. Secure payment in CAD, Canadian tax compliance, and fast shipping.",
    images: [
      {
        url: "https://apexmodularconstruction.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Apex Modular Construction - Your Trusted Partner for Construction Success",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Modular Construction - Construction Materials & Robots Marketplace",
    description:
      "Shop quality construction materials and robots from trusted Chinese sellers.",
    images: ["https://apexmodularconstruction.com/opengraph-image"],
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
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col overflow-x-hidden" suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <ConditionalShell cmsNav={<CmsNavigation />}>
          <main className="flex-1">{children}</main>
        </ConditionalShell>
      </body>
    </html>
  );
}
