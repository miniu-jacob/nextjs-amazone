import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/app.config";
import ClientProviders from "@/components/shared/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${config.APP_NAME}`, // (1). APP_NAME을 config로부터 가져와서 template를 정의해 준다.
    default: `${config.APP_NAME}. ${config.APP_SLOGAN}`, // (2). APP_NAME과 APP_SLOGAN을 가져와서 default를 정의해 준다.
  },
  description: config.APP_DESCRIPTION, // (3). APP_DESCRIPTION을 가져와서 description을 정의해 준다.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
