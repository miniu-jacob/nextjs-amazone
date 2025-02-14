// components/shared/footer.tsx
"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { ChevronUp } from "lucide-react";

import useSettingStore from "@/hooks/use-setting-store";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { i18n } from "@/i18n-config";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  // 글로벌 설정에서 site, availableCurrencies, currency를 가져온다.
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore();

  // 지원하는 모든 언어 목록 가져오기(i18n.locales)
  const { locales } = i18n;

  // 현재 적용된 언어를 확인
  const locale = useLocale();
  // 다국어 번역 설정
  const t = useTranslations();
  return (
    <footer className="bg-black text-white underline-link">
      <div className="w-full">
        {/* 버튼에 클릭하면 top으로 갈 수 있도록 onClick 이벤트를 준다.  */}
        <Button
          variant={"ghost"}
          className="bg-gray-800 w-full rounded-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          {t("Footer.Back to top")}
          <ChevronUp className="mr-2 h-4 w-4" />
        </Button>
        {/* FOOTER LINK SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-6 pl-16">
          {/* 회사소개 영역 */}
          <div>
            <h3 className="font-bold mb-2">{t("Footer.Get to Know Us")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={"/page/careers"}>{t("Footer.Careers")}</Link>
              </li>
              <li>
                <Link href={"/page/blog"}>{t("Footer.Blog")}</Link>
              </li>
              <li>
                <Link href={"/page/about-us"}>{t("Footer.About name", { name: site.name })}</Link>
              </li>
            </ul>
          </div>

          {/* Make Money with Us 영역 */}
          <div>
            <h3 className="font-bold mb-2">{t("Footer.Make Money with Us")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={"page/sell"}>{t("Footer.Sell products on", { name: site.name })}</Link>
              </li>
              <li>
                <Link href={"page/become-affiliate"}>{t("Footer.Become an Affiliate")}</Link>
              </li>
              <li>
                <Link href={"page/advertise"}>{t("Footer.Advertise Your Products")}</Link>
              </li>
            </ul>
          </div>

          {/* "Let Us Help You" 섹션 */}
          <div>
            <h3 className="font-bold mb-2">{t("Footer.Let Us Help You")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/page/shipping">{t("Footer.Shipping Rates & Policies")}</Link>
              </li>
              <li>
                <Link href="/page/returns-policy">{t("Footer.Returns & Replacements")}</Link>
              </li>
              <li>
                <Link href="/page/help">{t("Footer.Help")}</Link>
              </li>
            </ul>
          </div>
        </div>{" "}
        {/* ========== END OF FOOTER LINK SECTION  */}
        {/* LOGO + LANGUAGE */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 flex flex-col items-center">
            <div className="flex items-center space-x-4 md:flex-wrap w-[350px]">
              {/* 사이트 로고 */}
              <Image
                src="/icons/logo.svg"
                alt={`${site.name} logo`}
                width={48}
                height={48}
                className="w-14"
                style={{ maxWidth: "100%", height: "auto" }}
              />

              {/* 언어 드롭다운 */}
              <Select value={locale} onValueChange={(value) => router.push(pathname, { locale: value })}>
                <SelectTrigger className="text-xs text-gray-800 dark:text-white text-nowrap max-w-[140px]">
                  <SelectValue placeholder={t("Footer.Select a language")} />
                </SelectTrigger>
                <SelectContent align="center">
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <Link href={pathname} className="w-full flex items-center space-x-2 gap-2">
                        <Image src={lang.icon} alt={lang.name} width={32} height={32} />
                        {lang.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 통화 드롭다운 */}
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value);
                  window.scrollTo(0, 0);
                }}>
                <SelectTrigger className="text-gray-800 dark:text-white text-xs max-w-[100px]">
                  <SelectValue placeholder={t("Footer.Select a currency")} />
                </SelectTrigger>
                <SelectContent align="center">
                  {availableCurrencies
                    .filter((x) => x.code)
                    .map((currency, index) => (
                      <SelectItem key={index} value={currency.code} className="text-xs">
                        {/* {currency.name}  */}
                        {currency.code}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>{" "}
        {/* ========== END OF LOGO + LANGUAGE */}
      </div>

      {/* 최하단 */}
      <div className="p-4">
        <div className="flex justify-center gap-3 text-sm">
          <Link href={"/page/conditions-of-use"}>{t("Footer.Conditions of Use")}</Link>
          <Link href={"/page/privacy-notice"}>{t("Footer.Privacy Notice")}</Link>
          <Link href={"/page/help"}>{t("Footer.Help")}</Link>
        </div>
        <div className="flex justify-center text-sm">
          <p>© {site.copyright}</p>
        </div>
        <div className="mt-8 flex justify-center text-sm text-gray-400">
          {site.address} | {site.phone}
        </div>
      </div>
    </footer>
  );
}
