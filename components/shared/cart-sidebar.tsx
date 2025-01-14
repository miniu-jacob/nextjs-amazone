// components/shared/cart-sidebar.tsx

import useCartStore from "@/hooks/use-cart-store";
import ProductPrice from "./product/product-price";
import { FREE_SHIPPING_MIN_PRICE } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TrashIcon } from "lucide-react";

export default function CartSidebar() {
  // (1). useCartStore에서 필요 데이터들을 가져온다.
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore();

  return (
    <div className="w-36 overflow-y-auto">
      <div className={`fixed border-l h-full`}>
        <div className="p-2 h-full flex flex-col gap-2 justify-start items-center">
          <div className="text-center space-y-2">
            <div>Subtotal</div>
            {/* 가격 정보 */}
            <div className="font-bold">
              <ProductPrice price={itemsPrice} plain />
            </div>
            {/* 소계 표시 및 배송 메시지 */}
            {itemsPrice > FREE_SHIPPING_MIN_PRICE && <div className="text-center text-xs"> Your order qualifies for FREE Shipping</div>}

            {/* GO TO CART 버튼 */}
            <Link href={"/cart"} className={cn(buttonVariants({ variant: "outline" }), "rounded-full hover:no-underline")}>
              Go to Cart
            </Link>
            {/* 구분선 */}
            <Separator className="mt-3" />
          </div>

          {/* 상품 목록 스크롤 */}
          <ScrollArea className="flex-1 w-full">
            {items.map((item) => (
              <div key={item.clientId}>
                <div className="my-3">
                  {/* 상품 이미지 */}
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative h-24">
                      <Image src={item.image} alt={item.name} fill sizes="20vw" className="object-contain" />
                    </div>
                  </Link>

                  {/* 상품 가격 */}
                  <div className="text-sm text-center font-bold">
                    <ProductPrice price={item.price} plain />
                  </div>

                  {/* 수량 선택 */}
                  <div className="flex gap-2 mt-2 justify-center ">
                    <Select
                      value={item.quantity.toString()}
                      onValueChange={(value) => {
                        updateItem(item, Number(value));
                      }}>
                      <SelectTrigger className="text-xs w-14 ml-1 h-auto py-0 ">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.countInStock }).map((_, i) => (
                          <SelectItem value={(i + 1).toString()} key={i + 1}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* 상품 삭제 버튼 */}
                    <Button variant={"outline"} size={"sm"} onClick={() => removeItem(item)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* 구분선 */}
                <Separator />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
