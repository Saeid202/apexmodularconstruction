import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    staleTimes: {
      dynamic: 0,   // never cache dynamic pages in the client router
      static: 180,  // cache static pages for 3 minutes
    },
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/seller/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'apexmodularconstruction.com';
    const preferWww = process.env.NEXT_PUBLIC_PREFER_WWW === 'true';
    
    if (preferWww) {
      // Redirect non-www to www
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: domain,
            },
          ],
          destination: `https://www.${domain}/:path*`,
          permanent: true,
        },
      ];
    } else {
      // Redirect www to non-www
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: `www.${domain}`,
            },
          ],
          destination: `https://${domain}/:path*`,
          permanent: true,
        },
      ];
    }
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // cache optimized images for 1 hour
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
