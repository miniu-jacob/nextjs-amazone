// middleware.ts

import { NextResponse } from "next/server"; // Step 1: 추가
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import NextAuth from "next-auth";
import authConfig from "./lib/auth.config";

// 로그인 없이 접근 가능한 페이지 경로 정의
const publicPages = ["/", "/search", "/login", "/register", "/cart", "/cart/(.*)", "/product/(.*)", "/page/(.*)"];

// 다국어 미들웨어 생성 (createMiddleware 함수 사용, routing 객체 전달)
const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

// 공개페이지, 로그인 필요 페이지인지 구분
export default auth((req) => {
  // Step 2: 쿠키 우선 로직 추가
  const userLocale = req.cookies.get("NEXT_LOCALE")?.value; // 쿠키에서 언어 가져오기
  if (userLocale) {
    const pathnameParts = req.nextUrl.pathname.split("/");
    if (!routing.locales.includes(pathnameParts[1])) {
      const url = req.nextUrl.clone();
      url.pathname = `/${userLocale}${req.nextUrl.pathname}`;
      return NextResponse.redirect(url);
    }
  }
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages.flatMap((p) => (p === "/" ? ["", "/"] : p)).join("|")})/?$`,
    "i",
  );

  // 요청된 페이지가 공개 페이지 목록에 포함되어 있는지 확인
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  // 공개 페이지라면 다국어 미들웨어만 실행
  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    if (!req.auth) {
      const newUrl = new URL(
        `/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname) || "/"}`, // 로그인 후 이동할 페이지
        req.nextUrl.origin, // 현재 도메인
      );

      return Response.redirect(newUrl);
    } else {
      return intlMiddleware(req);
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
