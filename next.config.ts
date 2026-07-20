import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "*.supabase.co" },
    ],
  },
  devIndicators: {
    // The client bottom nav mirrors to RTL, putting the last tab (Profile)
    // in the bottom-left corner — the same spot Next.js's dev indicator
    // uses by default, which then intercepts taps meant for that tab.
    position: "top-right",
  },
};

export default nextConfig;
