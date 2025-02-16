// components/shared/header/language-switcher.tsx

"use client";

import * as React from "react";
import { useLocale } from "next-intl"; // 현재 사용자가 선택한 언어 가져오기
// usePathname은 현재 페이지 경로를 가져오는데 사용된다. (언어 변경 시 페이지 유지)
import { Link, usePathname } from "@/i18n/routing"; // 다국어 라우팅을 위한 Link, usePathname 가져오기
import useSettingStore from "@/hooks/use-setting-store"; // 전역 설정(availableCurrencies, currency) 가져오기
import { setCurrencyOnServer } from "@/lib/actions/setting.actions"; // 통화 변경 시 서버 쿠키에 설정 저장
import { i18n } from "@/i18n-config"; // 지원되는 언어 목록 가져오기
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { startTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/navigation";
// import { clog } from "@/lib/jlogger";

export default function LanguageSwitcher() {
  // 지원되는 언어 목록(i18n 에서 리스트(locales)를 가져온다. )
  const { locales } = i18n;
  const locale = useLocale(); // 현재 사용자가 선택한 언어 가져오기
  const pathname = usePathname(); // 현재 페이지 경로 가져오기
  const router = useRouter();

  // 전역 설정에서 site, availableCurrencies, currency를 가져온다.
  const {
    setting: { availableCurrencies, currency },
    setCurrency,
  } = useSettingStore();

  // Step 1: 언어 변경 시 쿠키에 선택한 언어 저장
  const handleLocaleChange = (newLocale: string) => {
    // 쿠키에 선택한 언어 저장 (예: 1년)
    document.cookie = `NEXT_LOCALE=${newLocale}; Path=/; Max-age=31536000`;
    router.refresh(); // 페이지 새로고침
  };

  // 통화 변경 시 호출되는 handleCurrencyChange 함수
  const handleCurrencyChange = useCallback(
    async (newCurrency: string) => {
      await setCurrencyOnServer(newCurrency); // 서버에 쿠키로 설정 저장
      startTransition(() => {
        setCurrency(newCurrency); // 전역 설정에 통화 설정
      });
    },
    [setCurrency],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="header-button h-[41px]">
        <div className="flex items-center gap-1 text-xs">
          <Image src={locales.find((l) => l.code === locale)?.icon || locales[0].icon} alt={"language"} width={28} height={28} />
          {locale.toUpperCase().slice(0, 2)}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="center">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {locales.map((c) => (
            <DropdownMenuRadioItem key={c.name} value={c.code}>
              {/* <div className="w-full flex items-center gap-2 text-sm">
                 <Image src={c.icon} alt={c.name} width={28} height={28} />
                 {c.name}
               </div> */}
              <Link href={pathname} locale={c.code} className="w-full flex items-center gap-2 text-sm">
                <Image src={c.icon} alt={c.name} width={28} height={28} />
                {c.name}
              </Link>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />

        {/* 통화 */}
        <DropdownMenuLabel>Currency</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currency} onValueChange={handleCurrencyChange}>
          {availableCurrencies.map((c) => (
            <DropdownMenuRadioItem key={c.name} value={c.code} className="text-sm">
              {c.symbol} {c.code}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
