// types/index.ts

import { CartSchema, OrderItemSchema, ProductInputSchema } from "@/lib/validator";
import { z } from "zod";

export type IProductInput = z.infer<typeof ProductInputSchema>;

// Data 타입을 추가해 준다.
// 여기서 Data.type은 product, headerMenus, carousels로 구성되며, headerMenus와 carousels는 각각 배열이다.
export type Data = {
  products: IProductInput[];
  headerMenus: {
    name: string;
    href: string;
  }[];
  carousels: {
    image: string;
    url: string;
    title: string;
    buttonCaption: string;
    isPublished: boolean;
  }[];
};

// 주문아이템, 카트에 대한 타입을 정의해 준다.
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
