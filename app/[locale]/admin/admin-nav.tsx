// app/[locale]/admin/admin-nav.tsx

"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { title: "Overview", href: "/admin/overview" },
  { title: "Products", href: "/admin/products" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Users", href: "/admin/users" },
  { title: "Pages", href: "/admin/web-pages" },
  { title: "Settings", href: "/admin/settings" },
];

export function AdminNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  // 현재 위치를 가져온다.
  const pathname = usePathname();
  const t = useTranslations("Admin");

  return (
    <nav className={cn("flex items-center flex-wrap overflow-hidden gap-2 md:gap-4", className)} {...props}>
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("text-base font-semibold", pathname.includes(item.href) ? "" : "text-muted-foreground")}>
          {t(item.title)}
        </Link>
      ))}
    </nav>
  );
}
