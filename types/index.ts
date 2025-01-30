// types/index.ts

import { ReviewInputSchema } from "@/lib/review-validator";
import { UserInputSchema, UserSignInSchema, UserSignUpSchema } from "@/lib/user-validator";
import {
  CartSchema,
  OrderInputSchema,
  OrderItemSchema,
  ProductInputSchema,
  SettingInputSchema,
  ShippingAddressSchema,
} from "@/lib/validator";
import { z } from "zod";

export type IProductInput = z.infer<typeof ProductInputSchema>;

// Data 타입을 추가해 준다.
// 여기서 Data.type은 product, headerMenus, carousels로 구성되며, headerMenus와 carousels는 각각 배열이다.
export type Data = {
  // 설정 타입을 추가해 준다. (DB에서 가져오는 설정 정보)
  settings: ISettingInput[];
  users: IUserInput[];
  products: IProductInput[];
  // 리뷰 데이터를 추가해 준다.
  reviews: {
    title: string;
    rating: number;
    comment: string;
  }[];
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

// setting 타입
export type ISettingInput = z.infer<typeof SettingInputSchema>;

// 리뷰 타입 정의
export type IReviewInput = z.infer<typeof ReviewInputSchema>;
// 리뷰 상세 타입 정의 - 리뷰 상세 정보를 가져올 때 사용
// 리뷰 상세 정보에는 아이디와, 생성일자, 사용자의 이름이 포함된다.
export type IReviewDetails = IReviewInput & {
  _id: string;
  createdAt: string;
  user: {
    name: string;
  };
};
