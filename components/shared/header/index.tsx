// components/shared/header/index.tsx

import { config } from "@/lib/app.config";
import Image from "next/image";
import Link from "next/link";
import Search from "./search";
import data from "@/lib/data";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Menu from "./menu";

export default function Header() {
  return (
    <header className="bg-black text-white">
      <div className="px-2">
        {/* Header 1st: LOGO, Search, Login Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center font-extrabold text-2xl m-1">
              <Image src="/icons/logo.svg" width={40} height={40} alt={`${config.APP_NAME} logo`} />
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
      <div className="flex items-center px-3 mb-[1px] bg-gray-800">
        <Button variant={"ghost"} className="header-button flex items-center gap-1 text-base [&_svg]:size-6">
          <MenuIcon />
          All
        </Button>
        {/* MENU LIST */}
        <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
          {data.headerMenus.map((menu) => (
            <Link key={menu.href} href={menu.href} className="header-button !p-2">
              {menu.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
