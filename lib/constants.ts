// lib/constants.ts
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 9;

// 무료배송 기본값(최소값)
export const FREE_SHIPPING_MIN_PRICE = Number(process.env.FREE_SHIPPING_MIN_PRICE) || 35;

// 세금 비율
export const TAX_PRICE = 0.1;
