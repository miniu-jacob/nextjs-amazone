// app/[locale]/(root)/cart/[itemId]/cart-add-item.tsx

"use client";

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function CartAddItem({ itemId }: { itemId: string }) {
  // 카트 스토어에서 필요한 정보를 가져온다.
  const {
    cart: { items, itemsPrice },
  } = useCartStore();

  // 번역과 전역 설정
  const {
    setting: {
      common: { freeShippingMinPrice },
    },
  } = useSettingStore();
  const t = useTranslations();

  // 카트에서 아이템을 조회한다. 앞의 item.clientId는 카트에 있는 아이템(item)의 clientId를 의미한다.
  // 뒤의 itemId는 매개변수로 전달받은 itemId를 의미한다.
  const item = items.find((item) => item.clientId === itemId);
  if (!item) return notFound();

  // (2). 장바구니에 추가된 제품 정보를 표시한다.
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        {/* 카드 컴포넌트 */}
        <Card className="w-full rounded-none">
          <CardContent className="flex h-full items-center justify-center gap-3 py-4">
            <Link href={`/product/${item.slug}`}>
              <Image src={item.image} alt={item.name} width={80} height={80} style={{ maxWidth: "100%", height: "auto" }} />
            </Link>
            {/* 장바구니 추가 텍스트 */}
            <div>
              <h3 className="text-xl font-bold flex gap-2 my-2">
                <CheckCircle2Icon className="h-6 w-6 text-green-700" />
                {t("Cart.Added to cart")}
              </h3>
              <p className="text-sm">
                <span className="font-bold">{t("Cart.Color")}: </span> {item.color ?? "-"}
              </p>
              <p className="text-sm">
                <span className="font-bold">{t("Cart.Size")}: </span> {item.size ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* 무료 배송 기준 안내 */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex justify-center items-center">
                {/* 아이템의 총 가격이 무료배송 시준보다 작다면 배송비 추가 */}
                {itemsPrice < freeShippingMinPrice ? (
                  <div className="text-center text-sm">
                    {t("Cart.Add")}
                    <span className="text-green-700">
                      <ProductPrice price={freeShippingMinPrice - itemsPrice} plain />
                    </span>{" "}
                    {t("Cart.of eligible items to your order to qualify for FREE Shipping")}
                  </div>
                ) : (
                  // 무료배송 기준이라면
                  <div className="flex items-center">
                    <div className="text-sm">
                      <span className="text-green-700 text-sm">{t("Cart.Your order qualifies for FREE Shipping")}</span>
                      {t("Cart.Choose this option at checkout")}
                    </div>
                  </div>
                )}
              </div>
              {/* 장바구니 요약 및 버튼  */}
              <div className="lg:border-r lg:border-muted lg:pl-3 flex flex-col items-center gap-3">
                {/* 총 가격 보여주기 */}
                <div className="flex gap-3">
                  <span className="text-lg font-bold">{t("Cart.Cart Subtotal")}: </span>
                  <ProductPrice className="text-2xl" price={itemsPrice} />
                </div>
                {/* 몇개의 항목을 체크할지 보여주기 */}
                <Link href={`/checkout`} className={cn(buttonVariants(), "rounded-full w-full")}>
                  {t("Cart.Proceed to Checkout")} ({items.reduce((a, c) => a + c.quantity, 0)} items)
                </Link>
                <Link href={"/cart"} className={cn(buttonVariants({ variant: "outline" }), "rounded-full w-full")}>
                  {t("Cart.Go to Cart")}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 브라우징 히스토리 */}
      <BrowsingHistoryList />
    </div>
  );
}
