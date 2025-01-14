// components/shared/header/cart-button.tsx

"use client";

import useCartStore from "@/hooks/use-cart-store";
import useIsMounted from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";
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

  // (4). UI 를 랜더링한다.
  return (
    <Link href={"/cart"} className="px-1 header-button">
      <div className="flex items-end text-xs relative">
        <ShoppingCartIcon className="h-8 w-8" />
        {/* 마운트 된 상태에서만 랜더링한다.  */}
        {isMounted && (
          // 카트 아이콘 좌측 상단에 카트에 담긴 아이템 수량을 표시한다.
          <span
            className={cn(
              `bg-black px-1 rounded-full text-primary text-base font-bold absolute right-[20px] top-[-4px] z-10`,
              cartItemsCount >= 10 && "text-sm px-0 p-[1px]",
            )}>
            {cartItemsCount}
          </span>
        )}
        <span className="font-bold">Cart</span>
      </div>
    </Link>
  );
}
