// components/shared/header/sidebar.tsx

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { logout } from "@/lib/actions/user.actions";
import { auth } from "@/lib/auth";
import { ChevronRight, MenuIcon, UserCircle, X } from "lucide-react";
import Link from "next/link";

export default async function Sidebar({ categories }: { categories: string[] }) {
  const session = await auth();
  return (
    <Drawer direction="left">
      <DrawerTrigger className="header-button flex items-center !p-2">
        <MenuIcon className="h-5 w-5 mr-1" />
        All
      </DrawerTrigger>
      <DrawerContent className="w-[350px] top-0 mt-0">
        <div className="flex flex-col h-full">
          {/* LOGIN ICON AND WELCOME MSG */}
          <div className="dark bg-gray-800 text-foreground flex justify-between items-center">
            <DrawerHeader>
              <DrawerTitle className="flex items-center">
                <UserCircle className="h-6 w-6 mr-2" />
                {/* 세션이 있으면 이름을 보여준다. */}
                {session ? (
                  <DrawerClose asChild>
                    <Link href={"/account"}>
                      <span className="text-lg font-semibold">Hello, {session.user.name}</span>
                    </Link>
                  </DrawerClose>
                ) : (
                  // 세션이 없으면 로그인 링크를 보여 준다.
                  <DrawerClose asChild>
                    <Link href={"/login"}>
                      <span className="text-lg font-semibold">Hello, sign in</span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription />
            </DrawerHeader>
            {/* CLOSE BUTTON */}
            <DrawerClose asChild>
              <Button variant={"ghost"} size={"icon"} className="mr-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* CATEGORY AREA */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Shop By Department</h2>
            </div>
            <nav className="flex flex-col">
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link href={`/search?category=${category}`} className={`flex items-center justify-between item-button`}>
                    <span>{category}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* SETTING AND HELP */}
          <div className="border-t flex flex-col">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Help & Settings</h2>
            </div>
            <DrawerClose asChild>
              <Link href={"/account"} className="item-button">
                Your Account
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Link href={"/page/customer-service"} className="item-button">
                Customer Service
              </Link>
            </DrawerClose>
            {/* 세션이 있는 경우 로그아웃 버튼 */}
            {session ? (
              <form action={logout} className="w-full">
                <Button className="w-full justify-start item-button text-base" variant={"ghost"}>
                  Sign out
                </Button>
              </form>
            ) : (
              <Link href={"/login"} className="item-button">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
