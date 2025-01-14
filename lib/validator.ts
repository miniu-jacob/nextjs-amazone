// lib/validator.ts

import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

// 가격 정보를 따로 정의한다.
const Price = (field: string) =>
  // coerce는 입력된 값을 강제로 특정 타입(여기서는 숫자)으로 변환하는 zod의 유틸리티이다.
  // ex) "29.99" -> 29.99,   "abc" -> 오류 발생
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 29.99)`,
    );

// 상품 정보를 입력받는 폼의 스키마를 정의한다.
export const ProductInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  // 이미지는 배열로 받는다.
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(1, "Description is required"),
  isPublished: z.boolean(),
  price: Price("Price"),
  // 정가 정보
  listPrice: Price("List Price"),
  // 재고 수량
  countInStock: z.coerce.number().int().nonnegative("Count in stock must be a non-negative number"),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  avgRating: z.coerce.number().min(0, "Average rating must be at least 0").max(5, "Average rating must be at most 5"),
  numReviews: z.coerce.number().int().nonnegative("Number of reviews must be a non-negative number"),
  // 별점 분포
  ratingDistribution: z.array(z.object({ rating: z.number(), count: z.number() })).max(5),
  reviews: z.array(z.string()).default([]),
  // 총 판매 수량
  numSales: z.coerce.number().int().nonnegative("Number of sales must be a non-negative number"),
});

// 장바구니(카트)에 들어가는 아이템의 유효성 검사를 위한 스키마를 정의한다.
export const OrderItemSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"), // 클라이언트 ID
  product: z.string().min(1, "Product ID is required"), // 상품 ID
  name: z.string().min(1, "Name is required"), // 상품 이름
  slug: z.string().min(1, "Slug is required"), // 상품 슬러그
  category: z.string().min(1, "Category is required"), // 상품 카테고리
  quantity: z.number().int().nonnegative("Quantity must be a non-negative number"), // 수량
  countInStock: z.number().int().nonnegative("Quantity must be a non-negative number"), // 재고 수량
  image: z.string().min(1, "Image is required"), // 상품 이미지
  price: Price("Price"), // 가격
  size: z.string().optional(), // 사이즈
  color: z.string().optional(), // 색상
});

// 카트 유효성검사를 위한 스키마를 정의한다.
export const CartSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Cart must have at least one item"), // 카트에 담긴 아이템
  itemsPrice: z.number(), // 상품 가격
  taxPrice: z.optional(z.number()), // 세금
  shippingPrice: z.optional(z.number()), // 배송비
  totalPrice: z.number(), // 총 가격
  paymentMethod: z.optional(z.string()), // 결제 수단
  deliveryDateIndex: z.optional(z.number()), // 배송 날짜 인덱스
  expectedDeliveryDate: z.optional(z.date()), // 예상 배송 날짜
});
