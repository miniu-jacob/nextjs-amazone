// components/shared/header/user-button.tsx

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/user.actions";
import { auth } from "@/lib/auth";
import { clog } from "@/lib/jlogger";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default async function UserButton() {
  const session = await auth();
  clog.info("[UserButton] session", session);
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="header-button" asChild>
          <div className="flex items-center">
            {/* 세션에서 이름과 설명을 보여준다. */}
            <div className="flex flex-col text-xs text-left">
              <span>Hello, {session ? session.user.name : "sign in"}</span>
              <span className="font-bold">Account & Orders</span>
            </div>
            <ChevronDown />
          </div>
        </DropdownMenuTrigger>
        {/* 세션이 있는 경우 dropdown 메뉴를 보여준다. */}
        {session ? (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link href={"/account"} className="w-full">
                <DropdownMenuItem>Your account</DropdownMenuItem>
              </Link>
              <Link href={"/account/orders"} className="w-full">
                <DropdownMenuItem>Your orders</DropdownMenuItem>
              </Link>
              {/* ADMIN 인 경우에 한해서 ADMIN 메뉴 보여주기 */}
              {session.user.role === "admin" && (
                <Link href={"/admin/overview"} className="w-full">
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className="p-0 mb-1">
              <form className="w-full" action={logout}>
                <Button variant={"ghost"} className="w-full py-4 px-2 justify-start h-4">
                  Sign Out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          // 세션이 없는 경우를 랜더링한다.
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href={"/login"} className={cn(buttonVariants(), "w-full")}>
                  Sign in
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {/* 라벨 */}
            <DropdownMenuLabel>
              <div className="font-normal">
                New Customer ? <Link href={"/register"}>Sign up</Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
