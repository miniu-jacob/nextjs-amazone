import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

// const nextConfig: NextConfig = {    <--- 기존
const nextConfig: NextConfig = withNextIntl()({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  /* config options here */
});

export default nextConfig;
