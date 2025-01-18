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
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

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

// 장바구니 가격 계산에서 소수점 둘째 자리까지 계산하는 유틸리티
export const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// 장바구니 항목당 고유한 ID를 생성하는 유틸리티
export const generateId = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatError = (error: any): string => {
  if (error.name === "ZodError") {
    // (1). Object.keys() 함수를 사용하여 error.errors 객체의 키를 배열로 변환한다. (email, password)
    const fieldErrors = Object.keys(error.errors).map((field) => {
      // error 객체의 errors 객체의 키(field)에 해당하는 메시지를 반환한다.
      // 즉 email 키의 값은 "Invalid email"이고, password 키의 값은 "Invalid password"이다.
      // 이 값들이 배열로 fieldErrors에 저장된다.
      const errorMessage = error.errors[field].message;
      return errorMessage;
    });
    // (2). 배열로 변환된 fieldErrors를 join() 함수를 사용하여 문자열로 변환한다.
    return fieldErrors.join(". ");
  }
  // 다른 에러에 대한 처리
  else if (error.name === "ValidationError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const errorMessage = error.errors[field].message;
      return errorMessage;
    });
    return fieldErrors.join(". ");
  } else if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue)[0];
    return `${duplicateField} already exists.`;
  } else {
    // return 'Something Wrong'
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message);
  }
};
