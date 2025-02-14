// components/shared/header/cart-button.tsx

"use client";

import useCartSidebar from "@/hooks/use-cart-sidebar";
import useCartStore from "@/hooks/use-cart-store";
import useIsMounted from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function CartButton() {
  // (1). useIsMounted 훅을 사용하여 컴포넌트가 마운트되었는지를 확인할 수 있도록 한다.
  const isMounted = useIsMounted();

  // (2). 현재의 장바구니 상태를 가져온다.
  const {
    cart: { items },
  } = useCartStore();

  // (3). 장바구니에 있는 아이템의 수량을 계산한다.
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0);

  // (4). useCartSidebar 훅을 불러온다.
  const isCartSidebarOpen = useCartSidebar();

  // 다국어 지원
  const t = useTranslations();
  const locale = useLocale();

  const cartPosition = locale === "en-US" ? "right-[30px]" : locale === "ko-KR" ? "right-[54px]" : "right-[58px]";

  // (5). UI 를 랜더링한다.
  return (
    <Link href={"/cart"} className="px-1 header-button">
      <div className="flex items-end text-xs relative">
        <ShoppingCartIcon className="h-8 w-8" />
        {/* 마운트 된 상태에서만 랜더링한다.  */}
        {isMounted && (
          // 카트 아이콘 좌측 상단에 카트에 담긴 아이템 수량을 표시한다.
          <span
            className={cn(
              `bg-black px-1 rounded-full text-primary text-sm font-bold absolute top-[-3px] z-10 ${cartPosition}`,
              cartItemsCount >= 10 && "text-sm px-0 p-[1px]",
            )}>
            {cartItemsCount}
          </span>
        )}
        <span className="font-bold">{t("Header.Cart")}</span>
        {/* 카트 다음에 카트 슬라이더를 오픈 */}
        {isCartSidebarOpen && (
          <div
            className={`absolute top-[20px] right-[-16px] rotate-[-90deg] z-10 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-transparent border-b-background `}></div>
        )}
      </div>
    </Link>
  );
}
