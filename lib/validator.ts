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

// 배송 주소 스키마를 정의한다.
export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"), // 이름
  street: z.string().min(1, "Street is required"), // 주소
  city: z.string().min(1, "City is required"), // 도시
  postalCode: z.string().min(1, "Postal code is required"), // 우편번호
  province: z.string().min(1, "Province is required"), // 주
  phone: z.string().min(1, "Phone is required"), // 전화번호
  country: z.string().min(1, "Country is required"), // 국가
});

// 카트 유효성검사를 위한 스키마를 정의한다.
export const CartSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Cart must have at least one item"), // 카트에 담긴 아이템
  itemsPrice: z.number(), // 상품 가격
  taxPrice: z.optional(z.number()), // 세금
  shippingPrice: z.optional(z.number()), // 배송비
  totalPrice: z.number(), // 총 가격
  paymentMethod: z.optional(z.string()), // 결제 수단
  shippingAddress: z.optional(ShippingAddressSchema), // 배송 주소
  deliveryDateIndex: z.optional(z.number()), // 배송 날짜 인덱스
  expectedDeliveryDate: z.optional(z.date()), // 예상 배송 날짜
});

// 주문 데이터 관리 (Place order)
const MongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID" });

// order
export const OrderInputSchema = z.object({
  user: z.union([
    MongoId, // 유저 ID
    z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  ]),
  items: z.array(OrderItemSchema).min(1, "Order must contain at least one item"), // 주문 아이템
  shippingAddress: ShippingAddressSchema, // 배송 주소
  paymentMethod: z.string().min(1, "Payment method is required"), // 결제 수단
  paymentResult: z
    .object({
      id: z.string(), // 결제 ID
      status: z.string(), // 결제 상태
      email_address: z.string(), // 이메일 주소
      pricePaid: z.string(), // 결제 금액
    })
    .optional(),
  itemsPrice: Price("Items price"), // 상품 가격
  shippingPrice: Price("Shipping price"), // 배송비
  taxPrice: Price("Tax price"), // 세금
  totalPrice: Price("Total price"), // 총 가격
  expectedDeliveryDate: z.date().refine((value) => value > new Date(), "Expected delivery date must be in the future"), // 예상 배송 날짜
  isDelivered: z.boolean().default(false), // 배송 여부
  deliveredAt: z.date().optional(), // 배송 날짜
  isPaid: z.boolean().default(false), // 결제 여부
  paidAt: z.date().optional(), // 결제 날짜
});

// DB 설정의 유효성을 검증할 스키마 정의
export const SettingInputSchema = z.object({
  // 공통 설정
  common: z.object({
    defaultTheme: z.string().min(1, "Default theme is required").default("light"), // 기본 테마
    defaultColor: z.string().min(1, "Default color is required").default("gold"), // 기본 색상
  }),
  // 사이트 설정
  site: z.object({
    url: z.string().url("Invalid URL format").min(1, "Site URL is required"), // 사이트 URL
    name: z.string().min(1, "Site name is required"), // 사이트 이름
    email: z.string().email("Invalid email format").min(1, "Site email is required"), // 관리자 이메일
    phone: z.string().min(1, "Site phone is required"), // 관리자 전화번호
  }),
});
