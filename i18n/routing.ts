// i18n/routing.ts

import { i18n } from "@/i18n-config";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: i18n.locales.map((locale) => locale.code), //  지원하는 언어 목록 (예: "en-US", "ko-KR", "vi-VN")
  defaultLocale: "en-US", // 기본 언어 (예: "en-US")
  localePrefix: "as-needed", // 항상 언어 접두사를 사용할지 여부 (예: true)
  pathnames: {
    // 특정 경로에 대한 다국어 설정 (비워두면 자동 설정)
  },
});

// 라우팅을 기반으로 네비게이션을 생성한다.
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

/*
// createNavigation 에서 반환된 객체를 가져온다.
const navigation = createNavigation(routing);

export const Link = navigation.Link;
export const redirect = navigation.redirect;
export const usePathname = navigation.usePathname;
*/

/*
// 커스텀 타입 정의
export interface CustomRouter {
  push: (url: string) => void;
  // 필요하다면 replace, back 등의 메소드 추가
  replace?: (url: string) => void;
  back?: () => void;
  // 기타 필요한 메소드 추가
}

export function useRouter(): CustomRouter {
  return navigation.useRouter() as unknown as CustomRouter;
}

*/
