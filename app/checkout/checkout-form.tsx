// app/checkout/checkout-form.tsx

"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useCartStore from "@/hooks/use-cart-store";
import useIsMounted from "@/hooks/use-is-mounted";
import { config } from "@/lib/app.config";
import { AVAILABLE_DELIVERY_DATES, AVAILABLE_PAYMENT_METHODS, DEFAULT_PAYMENT_METHOD } from "@/lib/constants";
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
      paymentMethod = DEFAULT_PAYMENT_METHOD,
    },
    setShippingAddress,
    setPaymentMethod, // 결제 방법 설정에서 사용
    setDeliveryDateIndex, // 제품 리뷰 및 배송 날짜 설정에서 사용
    updateItem, // 제품 리뷰 및 배송 날짜 설정에서 사용
    removeItem, // 제품 리뷰 및 배송 날짜 설정에서 사용
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
    // TODO: Place order
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
              Ship to this address
            </Button>
            <p className="text-xs text-center py-2">
              Choose a shipping address payment method in order to calculate shipping, handling, and tax.
            </p>
          </div>
        )}

        {/* 배송주소가 선택되었고 결제 방법을 선택하지 않았을 때 isAddressSelected && !isPaymentMethodSelected && */}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className="mb-4">
            <Button className="rounded-full w-full" onClick={handleSelectPaymentMethod}>
              Use this payment method
            </Button>
            <p className="text-xs text-center py-2">
              Choose a payment method to continue checking out. You&apos;ll still have a chance to review and edit your order before
              it&apos;s final.
            </p>
          </div>
        )}

        {/* 배송주소를 선택하였고 결제방법을 선택한 경우 */}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button className="rounded-full w-full" onClick={handlePlaceOrder}>
              Place Your Order
            </Button>
            <p className="text-xs text-center py-2">
              By placing your order, you agree to {config.APP_NAME}&apos;s <Link href={"/page/privacy-policy"}>privacy notice</Link> and
              <Link href={"/page/conditions-of-service"}> conditions of use</Link>.
            </p>
          </div>
        )}

        {/* 결제 요약 정보 */}
        <div>
          <div className="text-lg font-bold">Order Summary</div>
          <div className="space-y-2">
            {/* 상품 정보 */}
            <div className="flex justify-between">
              <span>Items: </span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>

            {/* 배송비 정보 */}
            <div className="flex justify-between">
              <span>Shipping & Handling: </span>
              <span>
                {shippingPrice === undefined ? "--" : shippingPrice === 0 ? "FREE" : <ProductPrice price={shippingPrice} plain />}
              </span>
            </div>

            {/* 세금 정보  */}
            <div className="flex justify-between">
              <span> Tax: </span>
              <span>{taxPrice === undefined ? "--" : <ProductPrice price={taxPrice} plain />}</span>
            </div>
            {/* 주문 전체 */}
            <div className="flex justify-between pt-4 font-bold text-lg">
              <span> Order Total:</span>
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
                  <span>Shipping address</span>
                </div>
                {/* (b). 배송 정보 */}
                <div className="col-span-5">
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
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">1 </span>
                  <span>Enter shipping address</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form className="space-y-4" method="post" onSubmit={shippingAddressForm.handleSubmit(onSubmitShippingAddress)}>
                    <Card className="md:ml-8 my-4">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-lg font-bold mb-2">Your address</div>

                        {/* 이름  */}
                        <div className="flex flex-col gap-5 md:flex-row ">
                          <FormField
                            control={shippingAddressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter full name" {...field} />
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
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter address" {...field} />
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
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} />
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
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter province" {...field} />
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
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter country" {...field} />
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
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter postal code" {...field} />
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
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter phone number" {...field} />
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
                          Ship to this address
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
                  <span>Payment Method</span>
                </div>
                {/* 결제 방법 보여주기 */}
                <div className="col-span-5">
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
                    Change
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              // 주소를 이미 선택했다면 결제 방법을 선택할 수 있다.
              <>
                {/* 제목 */}
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">2</span>
                  <span>Choose a payment method</span>
                </div>
                {/* 카드 컴포넌트 */}
                <Card className="md:ml-8 my-4">
                  <CardContent className="p-4">
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                      {AVAILABLE_PAYMENT_METHODS.map((pm) => (
                        <div key={pm.name} className="flex items-center py-1">
                          <RadioGroupItem value={pm.name} id={`payment-${pm.name}`} />
                          <Label className="font-bold pl-2 cursor-pointer" htmlFor={`payment-${pm.name}`}>
                            {pm.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  {/* 카트 푸터 */}
                  <CardFooter className="p-4">
                    <Button onClick={handleSelectPaymentMethod} className="rounded-full font-bold">
                      Use this payment method
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">2</span>
                <span>Choose a payment method</span>
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
                  <span>Items and shipping</span>
                </div>
                {/* 배송 날짜 */}
                <div className="col-span-5">
                  <p>
                    Delivery date: {formatDateTime(calculateFutureDate(AVAILABLE_DELIVERY_DATES[deliveryDateIndex].daysToDeliver)).dateOnly}
                  </p>
                  <ul>
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
                    Change
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              // 그렇지 않고 결제 방법을 선택했고, 배송 주소가 있다면 이부분을 보여준다.
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">3</span>
                  <span>Review items and shipping</span>
                </div>
                <Card className="md:ml-8">
                  <CardContent className="p-4 space-y-2">
                    <p className="mb-2">
                      <span className="text-lg font-bold text-green-700">
                        Arriving {formatDateTime(calculateFutureDate(AVAILABLE_DELIVERY_DATES[deliveryDateIndex!].daysToDeliver)).dateOnly}
                      </span>{" "}
                      If you order in the next {timeUntilMidnight().hours} hours and {timeUntilMidnight().minutes} minutes.
                    </p>
                    {/* 좌측은(span-div-1) 상품 설명 및 개수, 우측은 라디오 버튼 > 배송 날짜 선택 */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
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
                                <SelectTrigger className="w-24">
                                  <SelectValue>Qty: {item.quantity}</SelectValue>
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
                                    Delete
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* SPAN DIV - 2 */}
                      <div className="font-bold">
                        <p className="mb-2">Choose a shipping speed: </p>
                        <ul>
                          <RadioGroup
                            value={AVAILABLE_DELIVERY_DATES[deliveryDateIndex!].name}
                            onValueChange={(value) =>
                              setDeliveryDateIndex(AVAILABLE_DELIVERY_DATES.findIndex((address) => address.name === value)!)
                            }>
                            {AVAILABLE_DELIVERY_DATES.map((dd) => (
                              <div key={dd.name} className="flex">
                                <RadioGroupItem value={dd.name} id={`address-${dd.name}`} />
                                <Label className="pl-2 space-y-2 cursor-pointer" htmlFor={`address-${dd.name}`}>
                                  <div className="text-green-700 font-semibold">
                                    {formatDateTime(calculateFutureDate(dd.daysToDeliver)).dateOnly}
                                  </div>
                                  <div>
                                    {(dd.freeShippingMinPrice > 0 && itemsPrice >= dd.freeShippingMinPrice ? 0 : dd.shippingPrice) === 0 ? (
                                      "FREE Shipping"
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
                <span>Items and shipping</span>
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
                    Place Your Order
                  </Button>
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      Order Total: <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className="text-xs">
                      {" "}
                      By placing your order, you agree to {config.APP_NAME}&apos;s <Link href="/page/privacy-policy">privacy notice</Link>{" "}
                      and
                      <Link href="/page/conditions-of-use"> conditions of use</Link>.
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
