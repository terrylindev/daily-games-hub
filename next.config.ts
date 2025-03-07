import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 't2.gstatic.com',
        pathname: '/faviconV2/**',
      },
      {
        protocol: 'https',
        hostname: 'icon.horse',
        pathname: '/icon/**',
      },
      {
        protocol: 'https',
        hostname: 'www.duckduckgo.com',
        pathname: '/favicon/**',
      },
    ],
  },
};

export default nextConfig;
