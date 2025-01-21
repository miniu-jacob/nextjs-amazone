// lib/actions/order.actions.ts
"use server";

import { Cart, OrderItem, ShippingAddress } from "@/types";
import { formatError, round2 } from "../utils";
import { AVAILABLE_DELIVERY_DATES, TAX_PRICE } from "../constants";
import { connectToDatabase } from "../db";
import { auth } from "../auth";
import { OrderInputSchema } from "../validator";
import Order from "../db/models/order.model";

type CalcDeliveryDateAndPriceProps = {
  items: OrderItem[];
  deliveryDateIndex?: number;
  shippingAddress?: ShippingAddress;
};

export const calcDeliveryDateAndPrice = async ({ items, shippingAddress, deliveryDateIndex }: CalcDeliveryDateAndPriceProps) => {
  // 상품의 개별 가격(item.price) 과 수량 (item.quantity) 을 곱하여 총 가격을 계산한다.
  // 초기값은 0으로 설정하기 위해 reduce() 함수의 두 번째 인자로 0을 전달한다.
  const itemsPrice = round2(items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  // 세금을 계산한다.
  // const taxPrice = round2(itemsPrice * TAX_PRICE); <-- 기존 코드
  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * TAX_PRICE); // 배송 주소가 없으면 세금을 계산하지 않는다.

  // 사용 가능한 배송 날짜 계산
  const deliveryDate =
    AVAILABLE_DELIVERY_DATES[
      deliveryDateIndex === undefined
        ? AVAILABLE_DELIVERY_DATES.length - 1 // 기본값: 마지막 날짜
        : deliveryDateIndex // 사용자가 선택한 날짜 인덱스
    ];

  // 배송비를 계산한다.
  // const shippingPrice = itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : 5; <-- 기존 코드
  const shippingPrice =
    !shippingAddress || !deliveryDate // 배송 주속나 배송 날짜가 없으면 배송비 무료 (undefined)
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 && itemsPrice >= deliveryDate.freeShippingMinPrice // 무료배송 최소금액 이상이면 배송비 무료
      ? 0
      : deliveryDate.shippingPrice; // 기본 배송비

  // 최종 금액 계산
  const totalPrice = round2(itemsPrice + (shippingPrice ? round2(shippingPrice) : 0) + (taxPrice ? round2(taxPrice) : 0));

  // 각 금액들을 리턴한다.
  // return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  return {
    AVAILABLE_DELIVERY_DATES, // 사용 가능한 배송 날짜 반환
    deliveryDateIndex:
      deliveryDateIndex === undefined // 선택된 배송 날짜 반환
        ? AVAILABLE_DELIVERY_DATES.length - 1
        : deliveryDateIndex, // 기본값: 마지막 날짜
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

// CREATE - 주문 생성
export const createOrder = async (clientSideCart: Cart) => {
  try {
    // (a). DB 에 연결한다.
    await connectToDatabase();

    // (b). 사용자 인증 정보를 확인한다.
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    // (c). 함수를 호출하여 서버에서 주문을 생성한다. - 서버에서 가격과 날짜를 다시 계산한다.
    const createOrder = await createOrderFromCart(
      clientSideCart, // 클라이언트에서 전달받은 카트 정보
      session.user.id!, // 사용자 ID
    );

    // (d). 응답과 메시지, 데이터를 반환한다.
    return {
      success: true,
      message: "Order placed successfully",
      data: { orderId: createOrder._id.toString() },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createOrderFromCart = async (clientSideCart: Cart, userId: string) => {
  // (a). 클라이언트 데이터를 기반으로 서버에서 가격 및 배송날짜를 재계산한다.
  const cart = {
    ...clientSideCart, // 클라이언트에서 전달받은 카트 정보를 복사한다.
    ...calcDeliveryDateAndPrice({
      items: clientSideCart.items, // 클라이언트에서 전달받은 아이템 정보
      shippingAddress: clientSideCart.shippingAddress, // 클라이언트에서 전달받은 배송 주소
      deliveryDateIndex: clientSideCart.deliveryDateIndex, // 클라이언트에서 전달받은 배송 날짜 인덱스
    }),
  };

  // 스키마의 parse() 함수를 사용하여 데이터를 검증한다.
  const order = OrderInputSchema.parse({
    user: userId, // 사용자 ID
    items: cart.items, // 주문 아이템
    shippingAddress: cart.shippingAddress, // 배송 주소
    paymentMethod: cart.paymentMethod, // 결제 수단
    itemsPrice: cart.itemsPrice, // 상품 가격
    shippingPrice: cart.shippingPrice, // 배송비
    taxPrice: cart.taxPrice, // 세금
    totalPrice: cart.totalPrice, // 총 가격
    expectedDeliveryDate: cart.expectedDeliveryDate, // 예상 배송 날짜
  });

  return await Order.create(order);
};
