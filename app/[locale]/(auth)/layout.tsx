// app/(Auth)/layout.tsx
import { getSetting } from "@/lib/actions/setting.actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getSetting();
  return (
    <div className="flex flex-col items-center min-h-screen highlight-link">
      <header className="mt-8">
        <Link href={"/"}>
          <Image src={"/icons/logo.svg"} alt="logo" width={64} height={64} priority style={{ maxWidth: "100%", height: "auto" }} />
        </Link>
      </header>
      {/* 최대 너비를 max-w-sm으로 주면 모바일 사이즈에 적합한 화면 사이즈를 갖게 된다.  */}
      <main className="mx-auto max-w-sm min-w-80 p-4"> {children}</main>
      {/* flex-1으로 남은 부분을 모두 채우기 */}
      <footer className="mt-8 bg-gray-800 w-full flex flex-col gap-4 items-center p-8 text-sm flex-1">
        <div className="flex justify-center space-x-4">
          <Link href={"/page/conditions-of-use"}>Conditions of Use</Link>
          <Link href={"/page/privacy-policy"}>Privacy Notice</Link>
          <Link href={"/page/help"}>Help</Link>
        </div>
        <div>
          <p className="text-gray-400">{site.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
