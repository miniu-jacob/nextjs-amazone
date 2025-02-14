// app/[locale]/checkout/checkout-form.tsx

"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useCartStore from "@/hooks/use-cart-store";
import useIsMounted from "@/hooks/use-is-mounted";
import { ShippingAddressSchema } from "@/lib/validator";
import { ShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { calculateFutureDate, formatDateTime, timeUntilMidnight } from "@/lib/utils";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder } from "@/lib/actions/order.actions";
import { toast } from "@/hooks/use-toast";
import useSettingStore from "@/hooks/use-setting-store";
import { useLocale, useTranslations } from "next-intl";

// 기본 배송 주소 설정(개발환경)
const shippingAddressDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        fullName: "Jacob CHUNG",
        street: "1234 Main Street",
        city: "Seoul",
        province: "Gang Nam",
        phone: "01012345678",
        postalCode: "12345",
        country: "South Korea",
      }
    : { fullName: "", street: "", city: "", province: "", phone: "", postalCode: "", country: "" };

const CheckoutForm = () => {
  // 전역 설정에서 상수를 가져온다.
  const {
    setting: { site, availablePaymentMethods, defaultPaymentMethod, availableDeliveryDates },
  } = useSettingStore();

  const t = useTranslations();
  const locale = useLocale();

  // 배송 주소를 카트 스토어에서 가져온다.
  const {
    cart: {
      items,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalPrice,
      taxPrice,
      deliveryDateIndex,
      paymentMethod = defaultPaymentMethod,
    },
    setShippingAddress,
    setPaymentMethod, // 결제 방법 설정에서 사용
    setDeliveryDateIndex, // 제품 리뷰 및 배송 날짜 설정에서 사용
    updateItem, // 제품 리뷰 및 배송 날짜 설정에서 사용
    removeItem, // 제품 리뷰 및 배송 날짜 설정에서 사용
    clearCart, // 주문 성공 후 카트 비우기 (주문하기 부분)
  } = useCartStore();

  // 배송 주소, 결제 방법, 배송 날짜 선택 상태 관리
  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] = useState<boolean>(false);

  const router = useRouter();

  // 마운트 상태 정보
  const isMounted = useIsMounted();

  // 배송 주소 폼 관리
  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });

  // onSubmitShippingAddress 함수 정의
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    // 배송 주소를 설정한다.
    setShippingAddress(values);
    setIsAddressSelected(true);
  };

  // 결제 요약정보에 버튼을 클릭하면 호출할 함수를 정의한다.
  const handleSelectShippingAddress = () => {
    // 배송주소 폼에 handleSubmit을 호출한다.
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };

  // 배송 주소 폼 필드 업데이트
  useEffect(() => {
    if (!isMounted || !shippingAddress) return;
    shippingAddressForm.setValue("fullName", shippingAddress.fullName);
    shippingAddressForm.setValue("street", shippingAddress.street);
    shippingAddressForm.setValue("city", shippingAddress.city);
    shippingAddressForm.setValue("country", shippingAddress.country);
    shippingAddressForm.setValue("postalCode", shippingAddress.postalCode);
    shippingAddressForm.setValue("province", shippingAddress.province);
    shippingAddressForm.setValue("phone", shippingAddress.phone);
  }, [items, isMounted, router, shippingAddressForm, shippingAddress]);

  // 결제 요약 정보 > 주문하기 버튼 클릭
  const handlePlaceOrder = async () => {
    const response = await createOrder({
      items, // 장바구니 아이템
      shippingAddress, // 배송 주소
      expectedDeliveryDate: calculateFutureDate(availableDeliveryDates[deliveryDateIndex!].daysToDeliver), // 예상 배송 날짜
      deliveryDateIndex, // 배송 날짜 인덱스
      paymentMethod, // 결제 방법
      itemsPrice, // 상품 가격
      shippingPrice, // 배송비
      taxPrice, // 세금
      totalPrice, // 총 가격
    });
    // 주문이 실패하면 에러 메시지를 보여준다.

    if (!response.success || !response.data?.orderId) {
      toast({
        description: response.message,
        variant: "destructive",
      });
      return;
    } else {
      toast({
        description: response.message,
        variant: "default",
      });
    }

    // 주문 성공 후 카트를 비운다.
    clearCart();
    router.push(`/checkout/${response.data?.orderId}`);
  };

  // 결제 요약 정보 > 결제 방법 선택
  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
  };

  // Checkout Summary component
  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        {/* 배송주소가 선택되지 않은 경우에만 - !isAddressSelected &&  */}
        {!isAddressSelected && (
          <div className="border-b mb-4">
            <Button className="rounded-full w-full" onClick={handleSelectShippingAddress}>
              {t("Checkout.Ship to this address")}
            </Button>
            <p className="text-xs text-left py-2">{t("Checkout.Shipping Guide")}</p>
          </div>
        )}

        {/* 배송주소가 선택되었고 결제 방법을 선택하지 않았을 때 isAddressSelected && !isPaymentMethodSelected && */}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className="mb-4">
            <Button className="rounded-full w-full" onClick={handleSelectPaymentMethod}>
              {t("Checkout.Use this payment method")}
            </Button>
            <p className="text-xs text-left py-2">{t("Checkout.Payment Guide")}.</p>
          </div>
        )}

        {/* 배송주소를 선택하였고 결제방법을 선택한 경우 */}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button className="rounded-full w-full" onClick={handlePlaceOrder}>
              {t("Checkout.Place Your Order")}
            </Button>
            <p className="text-xs text-left py-2">
              {t.rich("Checkout.Order Agreement", {
                name: site.name,
                link1: (chunks) => <Link href="/page/privacy-policy">{chunks}</Link>,
                link2: (chunks) => <Link href="/page/conditions-of-use">{chunks}</Link>,
              })}
              .
            </p>
          </div>
        )}

        {/* 결제 요약 정보 */}
        <div className="space-y-2 text-sm">
          <div className="text-base font-bold">{t("Checkout.Order Summary")}</div>
          <div className="space-y-2">
            {/* 상품 정보 */}
            <div className="flex justify-between">
              <span>{t("Checkout.Items")}: </span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>

            {/* 배송비 정보 */}
            <div className="flex justify-between">
              <span>{t("Checkout.Shipping & Handling")}: </span>
              <span>
                {shippingPrice === undefined ? (
                  "--"
                ) : shippingPrice === 0 ? (
                  t("Checkout.FREE")
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>

            {/* 세금 정보  */}
            <div className="flex justify-between">
              <span> {t("Checkout.Tax")}: </span>
              <span>{taxPrice === undefined ? "--" : <ProductPrice price={taxPrice} plain />}</span>
            </div>
            {/* 주문 전체 */}
            <div className="flex justify-between pt-4 font-bold text-lg">
              <span> {t("Checkout.Order Total")}:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-6xl mx-auto highlight-link">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* SHIPPING ADDRESS */}
          <div>
            {/* (1). 배송 주소 정보가 있고 주소가 선택된 경우에만 랜더링 */}
            {isAddressSelected && shippingAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                {/* (a).  제목 */}
                <div className="col-span-5 text-lg font-bold flex">
                  <span className="w-8">1</span>
                  <span>{t("Checkout.Shipping address")}</span>
                </div>
                {/* (b). 배송 정보 */}
                <div className="col-span-5 text-sm">
                  <p>
                    {shippingAddress?.fullName} <br />
                    {shippingAddress?.street} <br />
                    {`${shippingAddress?.city}, ${shippingAddress?.province}, ${shippingAddress?.postalCode}, ${shippingAddress?.country}`}
                  </p>
                </div>
                {/* (c). 배송 주소 변경 버튼 */}
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsAddressSelected(false);
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(true);
                    }}>
                    {t("Checkout.Change")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">1 </span>
                  <span>{t("Checkout.Enter name", { name: t("Checkout.Shipping address") })}</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form className="space-y-4" method="post" onSubmit={shippingAddressForm.handleSubmit(onSubmitShippingAddress)}>
                    <Card className="md:ml-8 my-4">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-lg font-bold mb-2">{t("Checkout.Your address")}</div>

                        {/* 이름  */}
                        <div className="flex flex-col gap-5 md:flex-row ">
                          <FormField
                            control={shippingAddressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Full Name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Full Name") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* ADDRESS - street */}
                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Address")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Address") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* ADDRESS - city */}
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.City")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.City") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* ADDRESS - province */}
                          <FormField
                            control={shippingAddressForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Province")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Province") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* ADDRESS - country */}
                          <FormField
                            control={shippingAddressForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Country")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Country") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* ADDRESS - postalCode, phone */}
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Postal Code")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Postal Code") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Checkout.Phone Number")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("Checkout.Enter name", { name: t("Checkout.Address") })} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      {/* CARD FOOTER */}
                      <CardFooter className="p-4">
                        <Button type="submit" className="rounded-full font-bold">
                          {t("Checkout.Ship to this address")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>

          {/* 결제 방법  */}
          <div className="border-y">
            {/* (a). 결제 방법을 선택했고 결제 방법이 있을 때 */}
            {isPaymentMethodSelected && paymentMethod ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                <div className="flex text-lg font-bold col-span-5">
                  <span className="w-8">2</span>
                  <span>{t("Checkout.Payment Method")}</span>
                </div>
                {/* 결제 방법 보여주기 */}
                <div className="col-span-5 text-sm">
                  <p>{paymentMethod}</p>
                </div>

                {/* 결제 버튼 */}
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsPaymentMethodSelected(false);
                      if (paymentMethod) setIsDeliveryDateSelected(true);
                    }}>
                    {t("Checkout.Change")}
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              // 주소를 이미 선택했다면 결제 방법을 선택할 수 있다.
              <>
                {/* 제목 */}
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">2</span>
                  <span>{t("Checkout.Choose a payment method")}</span>
                </div>
                {/* 카드 컴포넌트 */}
                <Card className="md:ml-8 my-4">
                  <CardContent className="p-4">
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                      {availablePaymentMethods.map((pm) => (
                        <div key={pm.name} className="flex items-center py-1">
                          <RadioGroupItem value={pm.name} id={`payment-${pm.name}`} />
                          <Label className="font-bold pl-2 cursor-pointer" htmlFor={`payment-${pm.name}`}>
                            {pm.name === "Cash on Delivery"
                              ? t("Checkout.Cash on Delivery") // 현금 결제
                              : t("Checkout.name", { name: pm.name })}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  {/* 카트 푸터 */}
                  <CardFooter className="p-4">
                    <Button onClick={handleSelectPaymentMethod} className="rounded-full font-bold">
                      {t("Checkout.Use this payment method")}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">2</span>
                <span>{t("Checkout.Choose a payment method")}</span>
              </div>
            )}
          </div>

          {/* 아이템 리뷰 및 배송 날짜 관련 */}
          <div>
            {isDeliveryDateSelected && deliveryDateIndex != undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                {/* 제목 */}
                <div className="flex text-lg font-bold col-span-5">
                  <span className="w-8">3</span>
                  <span>{t("Checkout.Items and shipping")}</span>
                </div>
                {/* 배송 날짜 */}
                <div className="col-span-5 text-sm space-y-2">
                  <p>
                    {t("Checkout.Delivery date")}:{" "}
                    {formatDateTime(calculateFutureDate(availableDeliveryDates[deliveryDateIndex].daysToDeliver), locale).dateOnly}
                  </p>
                  <ul className="space-y-2">
                    {items.map((item, _index) => (
                      <li key={_index}>
                        {item.name} x {item.quantity} = {item.price}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 배송 날짜 변경 버튼 */}
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(false);
                    }}>
                    {t("Checkout.Change")}
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              // 그렇지 않고 결제 방법을 선택했고, 배송 주소가 있다면 이부분을 보여준다.
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">3</span>
                  <span>{t("Checkout.Review items and shipping")}</span>
                </div>
                <Card className="md:ml-8">
                  <CardContent className="p-4 space-y-2">
                    <p className="mb-2 text-sm">
                      <span className="text-lg font-bold text-green-700 pr-2">
                        {t("Checkout.Arriving", {
                          date: formatDateTime(calculateFutureDate(availableDeliveryDates[deliveryDateIndex!].daysToDeliver), locale)
                            .dateOnly,
                        })}
                      </span>{" "}
                      {t("Checkout.OrderDeadline", {
                        hours: timeUntilMidnight().hours,
                        minutes: timeUntilMidnight().minutes,
                      })}
                      .
                    </p>
                    {/* 좌측은(span-div-1) 상품 설명 및 개수, 우측은 라디오 버튼 > 배송 날짜 선택 */}
                    <div className="grid md:grid-cols-[3fr_1fr] gap-6">
                      <div className="col-span-2 md:col-span-1">
                        {/* 이미지 보여주기: SPAN DIV - 1 */}
                        {items.map((item, _index) => (
                          <div key={_index} className="flex gap-4 py-2">
                            <div className="relative w-16 h-16">
                              <Image src={item.image} alt={item.name} fill sizes="20vw" style={{ objectFit: "contain" }} />
                            </div>

                            {/* 제품 설명  */}
                            <div className="flex-1">
                              <p className="font-semibold">
                                {item.name}, {item.color}, {item.size}
                              </p>
                              <p className="font-bold">
                                <ProductPrice price={item.price} plain />
                              </p>
                              {/* 옵션 선택 */}
                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === "0") removeItem(item);
                                  else updateItem(item, Number(value));
                                }}>
                                <SelectTrigger className="w-24 my-2">
                                  <SelectValue>
                                    {t("Checkout.Qty")}: {item.quantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {Array.from({
                                    length: item.countInStock,
                                  }).map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                  <SelectItem key="delete" value="0">
                                    {t("Common.Delete")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* SPAN DIV - 2 */}
                      <div className="font-bold col-span-2 md:col-span-1 flex flex-col p-2">
                        <p className="mb-2">{t("Checkout.Choose a shipping speed")}: </p>
                        <ul>
                          <RadioGroup
                            value={availableDeliveryDates[deliveryDateIndex!].name}
                            onValueChange={(value) =>
                              setDeliveryDateIndex(availableDeliveryDates.findIndex((address) => address.name === value)!)
                            }>
                            {availableDeliveryDates.map((dd) => (
                              <div key={dd.name} className="flex">
                                <RadioGroupItem value={dd.name} id={`address-${dd.name}`} />
                                <Label className="pl-2 space-y-2 cursor-pointer" htmlFor={`address-${dd.name}`}>
                                  <div className="text-green-700 font-semibold">
                                    {formatDateTime(calculateFutureDate(dd.daysToDeliver), locale).dateOnly}
                                  </div>
                                  <div>
                                    {(dd.freeShippingMinPrice > 0 && itemsPrice >= dd.freeShippingMinPrice ? 0 : dd.shippingPrice) === 0 ? (
                                      t("Checkout.FREE Shipping")
                                    ) : (
                                      <ProductPrice price={dd.shippingPrice} plain />
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">3</span>
                <span>{t("Checkout.Items and shipping")}</span>
              </div>
            )}
          </div>
          {/* 결제 방법이 있고 배송 주소가 있는 경우에 대한 처리 */}
          {isPaymentMethodSelected && isAddressSelected && (
            <div className="mt-6">
              <div className="block md:hidden">
                <CheckoutSummary />
              </div>

              <Card className="hidden md:block ">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  <Button onClick={handlePlaceOrder} className="rounded-full">
                    {t("Checkout.Place Your Order")}
                  </Button>
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      {t("Checkout.Order Total")}: <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className="text-xs py-1">
                      {t.rich("Checkout.Order Agreement", {
                        name: site.name,
                        link1: (chunks) => <Link href="/page/privacy-policy">{chunks}</Link>,
                        link2: (chunks) => <Link href="/page/conditions-of-use">{chunks}</Link>,
                      })}
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
};

export default CheckoutForm;
