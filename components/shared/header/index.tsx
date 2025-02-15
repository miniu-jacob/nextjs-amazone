// components/shared/header/index.tsx

import Image from "next/image";
import Link from "next/link";
import Search from "./search";
import data from "@/lib/data";
import Menu from "./menu";
import { getAllCategories } from "@/lib/actions/product.actions";
import Sidebar from "./sidebar";

// 설정 및 다국어지원
import { getSetting } from "@/lib/actions/setting.actions";
import { getTranslations } from "next-intl/server";
// import { Link } from "@/i18n/routing";

export default async function Header() {
  // 전체 카테고리를 가져오는 서버 액션 호출
  // 관리자인지 체크해서 메뉴에 forAdmin 전달
  // const session = await auth();
  // const isAdmin = session?.user?.role === "admin";
  const categories = await getAllCategories();

  const { site } = await getSetting(); // 사이트 설정 가져오기
  const t = await getTranslations(); // 다국어 번역 데이터 가져오기

  return (
    <header className="bg-black text-white">
      <div className="px-2">
        {/* Header 1st: LOGO, Search, Login Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center font-extrabold text-2xl m-1 header-button gap-1">
              <Image src={site.logo} width={40} height={40} alt={`${site.name}`} />
              {site.name}
            </Link>
          </div>

          {/* SEARCH BOX - md 이상에서만 보이고 나머지는 숨긴다. */}
          <div className="hidden md:block flex-1 max-w-xl">
            <Search />
          </div>

          <Menu />
        </div>{" "}
        {/* 로고와 검색 박스 영역 끝 */}
        {/* SEARCH BOX - MOBILE */}
        <div className="md:hidden block mt-2">
          <Search />
        </div>
      </div>
      {/* Header - 2nd: MENU ICON */}
      <div className="flex items-center px-3 mb-[1px] bg-gray-800 ">
        <Sidebar categories={categories} />

        {/* MENU LIST */}
        <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
          {data.headerMenus.map((menu) => (
            <Link key={menu.href} href={menu.href} className="header-button text-sm !p-2">
              {t("Header." + menu.name)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
