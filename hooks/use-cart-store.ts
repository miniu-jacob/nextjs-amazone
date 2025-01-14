// hooks/use-cart-store.ts

import { calcDeliveryDateAndPrice } from "@/lib/actions/order.actions";
import { Cart, OrderItem } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 기본값을 설정한다. 타입은 types에 정의된 Cart 타입으로 설정한다. Cart 타입은 Cart 스키마를 따른다.
const initialState: Cart = {
  items: [], // 카트에 담긴 아이템 > 초기값은 빈 배열이다.
  itemsPrice: 0, // 상품 가격 > 초기값은 0이다.
  taxPrice: undefined, // 세금 > 초기값은 undefined
  shippingPrice: undefined, // 배송비 > 초기값은 undefined
  totalPrice: 0, // 총 가격 > 초기값은 0 이다.
  paymentMethod: undefined, // 결제 수단 > 초기값은 undefined
  deliveryDateIndex: undefined, // 배송 방법 인덱스 > 초기값은 undefined
};

// 카트 상태에 대한 인터페이스를 정의한다.
interface CartState {
  cart: Cart; // 카트 상태를 정의하면서 타입을 Cart로 설정한다.
  // 아이템을 카트에 추가하는 메소드로 제품의 clientId를 반환한다.
  addItem: (item: OrderItem, quantity: number) => Promise<string>; // 아이템을 추가하는 함수를 정의한다.
  // 상품 업데이트, 제거 함수 추가
  updateItem: (item: OrderItem, quantity: number) => Promise<void>; // 아이템을 업데이트하는 함수를 정의한다.
  removeItem: (item: OrderItem) => void;
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState, // 초기값을 설정한다.

      addItem: async (item: OrderItem, quantity: number) => {
        // get() 함수를 사용하여 현재 카트 상태를 가져온다.
        const { items } = get().cart;

        // 카트에 있는 아이템이 이미 있는지 확인한다.
        const existItem = items.find((x) => x.product === item.product && x.color === item.color && x.size === item.size);

        // 만약 이미 있는 아이템이라면 수량을 더한다.
        if (existItem) {
          // 아이템의 재고가 충분한지 확인한다.
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error("Not enough items in stock");
          }
        } else {
          if (item.countInStock < item.quantity) {
            throw new Error("Not enough items in stock");
          }
        }

        // 카트를 업데이트한다.
        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product && x.color === item.color && x.size === item.size ? { ...existItem, quantity: quantity } : x,
            )
          : [...items, { ...item, quantity }];

        // 카트(장바구니) 상태를 업데이트한다.
        set({
          cart: {
            ...get().cart, // 기존 카트 상태를 가져온다.
            items: updatedCartItems, // 업데이트된 아이템을 설정한다.
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems, // 업데이트된 아이템을 설정한다.
            })),
          },
        });

        // 제품의 clientId를 반환한다.
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        return updatedCartItems.find((x) => x.product === item.product && x.color === item.color && x.size === item.size)?.clientId!;
      }, // End of addItem

      // ### (2). 상품 업데이트 함수 정의
      updateItem: async (item: OrderItem, quantity: number) => {
        // get() 함수를 사용하여 현재 카트 상태를 가져온다.
        const { items } = get().cart;

        // 카트에 있는 아이템이 이미 있는지 확인한다.
        const exist = items.find((x) => x.product === item.product && x.color === item.color && x.size === item.size);
        if (!exist) return;

        // 상품의 수량을 업데이트한다.
        const updatedCartItems = items.map((x) =>
          x.product === item.product && x.color === item.color && x.size === item.size ? { ...exist, quantity } : x,
        );

        // 카트(장바구니) 상태를 업데이트한다.
        set({
          cart: {
            ...get().cart, // 기존 카트 상태를 가져온다.
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({ items: updatedCartItems })), // 배송 정보를 업데이트한다.
          },
        });
      },
      // ### (3). 아이템을 제거하는 함수를 정의한다.
      removeItem: async (item: OrderItem) => {
        const { items } = get().cart; // get() 함수를 사용하여 현재 카트 상태를 가져온다.
        const updatedCartItems = items.filter((x) => x.product !== item.product || x.color !== item.color || x.size !== item.size);
        // 카트(장바구니) 상태를 업데이트한다.
        set({
          cart: {
            ...get().cart, // 기존 카트 상태를 가져온다.
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({ items: updatedCartItems })), // 배송 정보를 업데이트한다.
          },
        });
      },
      init: () => set({ cart: initialState }), // 초기화 함수를 정의한다.
    }),
    {
      name: "cart-store",
    },
  ),
);

export default useCartStore;
