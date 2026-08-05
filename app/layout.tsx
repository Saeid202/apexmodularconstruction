import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { CmsNavigation } from "@/components/layout/CmsNavigation";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { CartSessionSync } from "@/components/cart/CartSessionSync";
import { getSiteSettings } from "@/app/actions/cms-settings";
import { headers } from "next/headers";

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
        url: "https://apexmodularconstruction.com/logo.png",
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
    images: ["https://apexmodularconstruction.com/logo.png"],
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
  const settings = await getSiteSettings();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  let isSubdomain = false;
  if (host && host !== rootDomain && host !== "apex.com" && host !== "www.apex.com") {
    if (host.endsWith(`.${rootDomain}`) || host.endsWith(".apex.com")) {
      isSubdomain = true;
    }
  }

  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col overflow-x-hidden" suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <CartSessionSync />
        <ConditionalShell
          cmsNav={<CmsNavigation />}
          footer={<Footer socialLinks={settings.social_links} />}
          isSubdomain={isSubdomain}
        >
          <main className="flex-1">{children}</main>
        </ConditionalShell>
      </body>
    </html>
  );
}
