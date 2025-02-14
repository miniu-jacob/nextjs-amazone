import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

// const nextConfig: NextConfig = {    <--- 기존
const nextConfig: NextConfig = withNextIntl()({
  i18n: {
    locales: ["en-US", "ko-KR", "vi-VN"],
    defaultLocale: "en-US",
    localeDetection: false, // 자동 감지 비활성화
  },
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
