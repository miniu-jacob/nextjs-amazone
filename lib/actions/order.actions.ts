// lib/actions/order.actions.ts

import { OrderItem } from "@/types";
import { round2 } from "../utils";
import { FREE_SHIPPING_MIN_PRICE, TAX_PRICE } from "../constants";

type CalcDeliveryDateAndPriceProps = {
  items: OrderItem[];
  deliveryDateIndex?: number;
};

export const calcDeliveryDateAndPrice = async ({ items }: CalcDeliveryDateAndPriceProps) => {
  // 상품의 개별 가격(item.price) 과 수량 (item.quantity) 을 곱하여 총 가격을 계산한다.
  // 초기값은 0으로 설정하기 위해 reduce() 함수의 두 번째 인자로 0을 전달한다.
  const itemsPrice = round2(items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  // 배송비를 계산한다.
  const shippingPrice = itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : 5;
  // 세금을 계산한다.
  const taxPrice = round2(itemsPrice * TAX_PRICE);

  // 최종 금액 계산
  const totalPrice = round2(itemsPrice + (shippingPrice ? round2(shippingPrice) : 0) + (taxPrice ? round2(taxPrice) : 0));

  // 각 금액들을 리턴한다.
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};
