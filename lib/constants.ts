import { config } from "./app.config";

// lib/constants.ts
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 9;

// 무료배송 기본값(최소값)
export const FREE_SHIPPING_MIN_PRICE = Number(process.env.FREE_SHIPPING_MIN_PRICE) || 35;

// 세금 비율
export const TAX_PRICE = 0.1;

// CopyRight 문자열 설정
export const APP_COPYRIGHT = process.env.NEXT_PUBLIC_APP_COPYRIGHT || `CopyRight © 2025 ${config.APP_NAME}. All rights reserved.`;

// 결제 방법 상수화
export const AVAILABLE_PAYMENT_METHODS = [
  {
    name: "PayPal",
    commission: 0,
    isDefault: true,
  },
  {
    name: "Stripe",
    commission: 0,
    isDefault: true,
  },
  {
    name: "Cash On Delivery",
    commission: 0,
    isDefault: true,
  },
];

export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const AVAILABLE_DELIVERY_DATES = [
  {
    name: "Tomorrow",
    daysToDeliver: 1,
    shippingPrice: 12.9,
    freeShippingMinPrice: 0,
  },
  {
    name: "Next 3 Days",
    daysToDeliver: 3,
    shippingPrice: 6.9,
    freeShippingMinPrice: 0, // 무료배송 최소금액
  },
  {
    name: "Next 5 Days",
    daysToDeliver: 5,
    shippingPrice: 4.9,
    freeShippingMinPrice: 35, // 무료배송 최소금액
  },
];

// 서버 URL 등록
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const SENDER_EMAIL = process.env.SENDER_EMAIL || "support@miniu.kr";
export const SENDER_NAME = process.env.SENDER_NAME || config.APP_NAME;

// Admin Dashboard 사용자 정보 변경 시 필요한 사용자 권한을 설정한다. (owner 를 추가해 줬다. -> SuperUser 권한)
export const USER_ROLES = ["admin", "user", "owner"];
