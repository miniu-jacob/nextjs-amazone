// lib/actions/order.actions.ts

import { OrderItem, ShippingAddress } from "@/types";
import { round2 } from "../utils";
import { AVAILABLE_DELIVERY_DATES, TAX_PRICE } from "../constants";

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
