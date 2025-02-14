// app/[locale]/admin/layout.tsx

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AdminNav } from "./admin-nav";
import Menu from "@/components/shared/header/menu";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getSetting();
  return (
    <>
      <div className="flex flex-col">
        {/* HEADER */}
        <div className="bg-black text-white">
          <div className="flex h-16 items-center px-2">
            <Link href={"/"}>
              <Image src={"/icons/logo.svg"} width={48} height={48} alt={`${site.name} logo`} />
            </Link>
            {/* DESKTOP ADMIN - NAV */}
            <AdminNav className="mx-6 hidden md:flex" />
            {/* MENU FOR ADMIN */}
            <div className="ml-auto ">
              <Menu forAdmin />
            </div>
          </div>
          {/* MOBILE NAV - ADMIN */}
          <div>
            <AdminNav className="flex md:hidden px-4 pb-2" />
          </div>
        </div>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </>
  );
}
