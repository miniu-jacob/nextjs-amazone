// types/index.ts

import { UserInputSchema, UserSignInSchema, UserSignUpSchema } from "@/lib/user-validator";
import { CartSchema, OrderInputSchema, OrderItemSchema, ProductInputSchema, ShippingAddressSchema } from "@/lib/validator";
import { z } from "zod";

export type IProductInput = z.infer<typeof ProductInputSchema>;

// Data 타입을 추가해 준다.
// 여기서 Data.type은 product, headerMenus, carousels로 구성되며, headerMenus와 carousels는 각각 배열이다.
export type Data = {
  users: IUserInput[];
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
export type IOrderInput = z.infer<typeof OrderInputSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// 로그인을 위한 타입을 선언한다.
export type IUserInput = z.infer<typeof UserInputSchema>;
export type IUserSignIn = z.infer<typeof UserSignInSchema>;

// 회원가입을 위한 타입을 선언한다.
export type IUserSignUp = z.infer<typeof UserSignUpSchema>;

// 주문 관리를 위한 타입 정의
