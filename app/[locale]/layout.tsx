// app/[locale]/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ClientProviders from "@/components/shared/client-providers";
import { NextIntlClientProvider } from "next-intl"; // next-intl의 NextIntlClientProvider를 불러온다.
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing"; // 지원되는 locales 목록을 가져온다.
import { notFound } from "next/navigation"; // notFound를 불러온다.
import { cookies } from "next/headers"; // cookies를 불러온다.
import { getSetting } from "@/lib/actions/setting.actions";
import { clog } from "@/lib/jlogger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  // 글로벌 설정 내용을 불러온다. (getSetting 함수를 사용한다.)
  const {
    site: { slogan, name, description, url },
  } = await getSetting();

  return {
    title: {
      template: `%s | ${name}`, // 글로벌 설정에서 가져온 name을 title에 넣어준다.
      default: `${name}. ${slogan}`, // 글로벌 설정에서 가져온 name과 slogan을 default에 넣어준다.
    },
    description: description, // 글로벌 설정에서 가져온 description을 description에 넣어준다.
    metadataBase: new URL(url), // 글로벌 설정에서 가져온 url을 metadataBase에 넣어준다.
  };
}

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: { locale: string };
  children: React.ReactNode;
}>) {
  // getSetting를 통해 설정을 가져온다.
  const setting = await getSetting();
  // 쿠키에서 currency 정보를 가져오고 없다면 기본값을 설정
  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "USD";

  const { locale } = await params;

  clog.info("[RootLayout] locale", locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 현재 언어에 맞는 번역된 메시지를 가져온다.
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
