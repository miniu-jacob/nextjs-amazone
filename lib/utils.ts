// lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 숫자를 문자열로 변환한 뒤, 소수점 자릿수를 항상 2자리로 맞추는 유틸리티
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : int;
};

// 문자열을 슬러그로 변환하는 유틸리티
export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

// 숫자를 통화 형식으로 변환하는 유틸리티
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD", // 통화 단위
  style: "currency", // 통화 형식
  minimumFractionDigits: 2, // 소수점 자릿수
});

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

// 숫자를 천 단위로 콤마(,)를 찍어주는 유틸리티
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}
