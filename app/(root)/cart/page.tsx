// app/(root)/cart/page.tsx

"use client";

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import { config } from "@/lib/app.config";
import { FREE_SHIPPING_MIN_PRICE } from "@/lib/constants";
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

  // 전체 화면 랜더링
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
        {/* 장바구니가 비어 있는 경우에 대한 처리 */}
        {items.length === 0 ? (
          <Card className="col-span-4 rounded-none">
            <CardHeader className="text-3xl">Your Shopping Cart is Empty</CardHeader>
            <CardContent>
              Continue shopping on <Link href={"/"}>{config.APP_NAME}</Link>
            </CardContent>
          </Card>
        ) : (
          // 장바구니에 아이템이 있는 경우에 대한 처리
          <>
            <div className="col-span-3">
              <Card className="rounded-none">
                <CardHeader className="text-3xl pb-0">Shopping Cart</CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-end border-b mb-4">Price</div>
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
                        <div>
                          <p className="text-sm">
                            <span className="font-bold">Color: </span> {item.color}
                          </p>
                          <p className="text-sm">
                            <span className="font-bold">Size: </span> {item.size}
                          </p>
                        </div>
                        {/* 수량 변경 및 삭제 버튼 */}
                        <div className="flex gap-2 items-center">
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) => {
                              updateItem(item, Number(value));
                            }}>
                            <SelectTrigger className="w-auto space-x-3">
                              <SelectValue>Quantity: {item.quantity}</SelectValue>
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
                            Delete
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
                  <div className="flex justify-end text-lg my-2">
                    Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} Items):{" "}
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
                  {itemsPrice < FREE_SHIPPING_MIN_PRICE ? (
                    <div className="flex-1">
                      Add{" "}
                      <span className="text-green-700">
                        <ProductPrice price={FREE_SHIPPING_MIN_PRICE - itemsPrice} plain />
                      </span>{" "}
                      of eligible items to your order to qualify for FREE Shipping
                    </div>
                  ) : (
                    // 무료 배송 가능 금액 이상인 경우
                    <div className="flex-1">
                      <span className="text-green-700">Your order qualifies for FREE Shipping</span> Choose this option at checkout
                    </div>
                  )}
                  {/* 배송비를 포함한 가격을 랜더링 */}
                  <div className="text-lg">
                    Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items):{" "}
                    <span className="font-bold">
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>
                  {/* 결제 버튼을 랜더링 */}
                  <Button onClick={() => router.push("/checkout")} className="w-full rounded-full">
                    Proceed to Checkout
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
