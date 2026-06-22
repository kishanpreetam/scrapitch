import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Pricing was removed: the product is free with no tiers.
      { source: "/pricing", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
