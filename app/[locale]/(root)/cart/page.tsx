// app/[locale]/(root)/cart/page.tsx

"use client";

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore();

  const router = useRouter();

  const {
    setting: {
      site,
      common: { freeShippingMinPrice },
    },
  } = useSettingStore();
  const t = useTranslations();

  // 전체 화면 랜더링
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
        {/* 장바구니가 비어 있는 경우에 대한 처리 */}
        {items.length === 0 ? (
          <Card className="col-span-4 rounded-none">
            <CardHeader className="text-2xl font-bold">{t("Cart.Your Shopping Cart is empty")}</CardHeader>
            <CardContent className="text-base">
              {t.rich("Cart.Continue shopping on", {
                name: site.name,
                home: (chunks) => <Link href="/">{chunks}</Link>,
              })}
            </CardContent>
          </Card>
        ) : (
          // 장바구니에 아이템이 있는 경우에 대한 처리
          <>
            <div className="col-span-3">
              <Card className="rounded-none">
                <CardHeader className="text-2xl font-bold pb-0">{t("Cart.Shopping Cart")}</CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-end border-b mb-4 text-sm">{t("Cart.Price")}</div>
                  {items.map((item) => (
                    <div key={item.clientId} className="flex flex-col md:flex-row justify-between py-4 border-b gap-4">
                      {/* 상품 반복 랜더링 시 클릭하면 해당 상품 상세 페이지로 이동하도록 */}
                      <Link href={`/product/${item.slug}`} className="relative w-40 h-40">
                        <Image src={item.image} alt={item.name} fill sizes="20vw" style={{ objectFit: "contain" }} />
                      </Link>

                      {/* 제품 이름 및 속성 표시 - 이미지 우측 박스 */}
                      <div className="flex-1 space-y-4">
                        <Link href={`/product/${item.slug}`} className="text-lg hover:no-underline">
                          {item.name}
                        </Link>
                        {/* 색상 및 사이즈 */}
                        <div className="grid grid-rows-2 grid-cols-[50px_1fr] gap-y-1 gap-x-4 text-sm">
                          <p className="text-sm font-bold">
                            <span className="font-bold">{t("Cart.Color")}</span>:
                          </p>
                          <p>{item.color}</p>

                          <p className="text-sm">
                            <span className="font-bold tracking-wider">{t("Cart.Size")}: </span>
                          </p>
                          <p>{item.size}</p>
                        </div>
                        {/* 수량 변경 및 삭제 버튼 */}
                        <div className="flex gap-2 items-center">
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) => {
                              updateItem(item, Number(value));
                            }}>
                            <SelectTrigger className="w-auto space-x-3">
                              <SelectValue>
                                {t("Cart.Quantity")}: {item.quantity}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {/* 재고를 배열로 만들어 보여준다. */}
                              {Array.from({ length: item.countInStock }).map((_, i) => (
                                <SelectItem key={i + 1} value={`${i + 1}`}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant={"outline"} onClick={() => removeItem(item)}>
                            {t("Cart.Delete")}
                          </Button>
                        </div>{" "}
                        {/* END - 수량 변경 및 삭제 버튼 */}
                      </div>
                      {/* 제품 가격 표시 - 제품이 1개 이하면 가격만 크게 표시, 2개 이상이면 계산식 포함  */}
                      <div>
                        <p className="text-right">
                          {item.quantity > 1 && (
                            <>
                              {item.quantity} x <ProductPrice price={item.price} plain />
                              <br />
                            </>
                          )}

                          <span className="font-bold text-lg">
                            <ProductPrice price={item.price * item.quantity} plain />
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}{" "}
                  {/* --- 여기까지 장바구니 아이템들 랜더링 */}
                  {/* 총 금액 표시  */}
                  <div className="flex justify-end text-base my-2 font-semibold">
                    {t("Cart.Subtotal")} ({items.reduce((acc, item) => acc + item.quantity, 0)} {t("Cart.Items")}):{" "}
                    <span className="font-bold ml-1">
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 무료 배송 여부 카드 랜더링 */}
            <div>
              <Card className="rounded-none">
                <CardContent className="py-4 space-y-4">
                  {itemsPrice < freeShippingMinPrice ? (
                    <div className="flex-1">
                      {t("Cart.Add")}{" "}
                      <span className="text-green-700">
                        <ProductPrice price={freeShippingMinPrice - itemsPrice} plain />
                      </span>{" "}
                      {t("Cart.of eligible items to your order to qualify for FREE Shipping")}
                    </div>
                  ) : (
                    // 무료 배송 가능 금액 이상인 경우
                    <div className="flex-1 text-xs">
                      <span className="text-green-700 text-sm">{t("Cart.Your order qualifies for FREE Shipping")}</span>{" "}
                      {t("Cart.Choose this option at checkout")}
                    </div>
                  )}
                  {/* 배송비를 포함한 가격을 랜더링 */}
                  <div className="text-base">
                    {t("Cart.Subtotal")} ({items.reduce((acc, item) => acc + item.quantity, 0)} {t("Cart.Items")}):{" "}
                    <span className="font-bold">
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>
                  {/* 결제 버튼을 랜더링 */}
                  <Button onClick={() => router.push("/checkout")} className="w-full rounded-full">
                    {t("Cart.Proceed to Checkout")}{" "}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      {/* 사용자가 본 상품을 보여준다. */}
      <BrowsingHistoryList className="mt-10" />
    </div>
  );
}
