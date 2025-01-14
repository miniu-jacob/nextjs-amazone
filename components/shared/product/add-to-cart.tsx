// components/shared/product/add-to-cart.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AddToCartProps = {
  item: OrderItem;
  minimal?: boolean; // 확장성을 위한 옵션(간단한 UI, 또는 확장된 UI 랜더링)
};

export default function AddToCart({ item, minimal = false }: AddToCartProps) {
  // 필요한 훅들 초기화
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  // 카트 선택된 수량 관리
  const [quantity, setQuantity] = useState(1); // 수량은 1로 초기화

  // minimal 옵션에 따라 UI 랜더링 - 간단한 UI
  return minimal ? (
    // 간단한 UI
    <Button
      className="rounded-full w-auto"
      // onClick 이벤트 핸들러 추가
      onClick={() => {
        try {
          addItem(item, 1); // 카트에 아이템 추가
          toast({
            description: "Added to Cart",
            action: (
              <Button
                onClick={() => {
                  router.push("/cart");
                }}>
                Go to Cart
              </Button>
            ),
          });

          // any 에러/경고 무시를 위해 상단에 주석 추가
          // 에러 발생 시 토스트 메시지 출력
        } catch (error: any) {
          toast({
            variant: "destructive",
            description: error.message,
          });
        }
      }}>
      Add to Cart
    </Button>
  ) : (
    // 확장된 UI
    <div className="w-full space-y-2">
      <Select value={quantity.toString()} onValueChange={(i) => setQuantity(Number(i))}>
        <SelectTrigger>
          <SelectValue>Quantity: {quantity}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}`}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* 카트에 담기 버튼 */}
      <Button
        className="rounded-full w-full"
        type="button"
        onClick={async () => {
          try {
            const itemId = await addItem(item, quantity); // 카트에 아이템 추가 후 아이템 ID 반환
            router.push(`/cart/${itemId}`); // 카트 페이지로 이동
          } catch (error: any) {
            toast({
              variant: "destructive",
              description: error.message,
            });
          }
        }}>
        Add to Cart
      </Button>
      {/* 즉시 구매 버튼 */}
      <Button
        className="w-full rounded-full"
        variant={"secondary"}
        onClick={() => {
          try {
            addItem(item, quantity); // 카트에 아이템 추가
            router.push("/checkout"); // 구매 페이지로 이동
          } catch (error: any) {
            toast({
              variant: "destructive",
              description: error.message,
            });
          }
        }}>
        Buy Now
      </Button>
    </div>
  );
}
