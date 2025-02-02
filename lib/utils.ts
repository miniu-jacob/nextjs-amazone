// lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ URL 파라미터를 변환하는 유틸 정의
export function formUrlQuery({ params, key, value }: { params: string; key: string; value: string | null }) {
  // a.1). URL 파라미터를 객체로 변환한다.
  const currentUrl = qs.parse(params);

  // a.2). 특정 키를 가진 URL 파라미터의 값을 입력받은 value로 변경한다.
  currentUrl[key] = value;

  // a.3). 변경된 쿼리 객체를 URL로 변환하여 반환한다.
  return qs.stringifyUrl(
    {
      url: window.location.pathname, // 현재 URL 경로를 유지한다.
      query: currentUrl, // 변경된 URL 파라미터 객체를 적용한다.
    },
    { skipNull: true }, // null 값은 URL 파라미터에서 제외한다.
  );
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

// 현재 날짜로부터 특정 일 수 (days) 후의 날짜를 계산하는 유틸
export function calculateFutureDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}

// 월 이름을 반환하는 유틸
export function getMonthName(yearAndMonth: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [year, monthNumber] = yearAndMonth.split("-");
  const date = new Date();

  // 해당 월로 세팅
  date.setMonth(parseInt(monthNumber) - 1);

  return new Date().getMonth() === parseInt(monthNumber) - 1
    ? `${date.toLocaleString("default", { month: "long" })} (ongoing)`
    : date.toLocaleString("default", { month: "long" });
}

// 지난 날짜 계산 유틸 함수
export function calculatePastDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return currentDate;
}

// 남은 시간 계산 유틸 함수
export function timeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Set to 12:00 AM (next day)

  const diff = midnight.getTime() - now.getTime(); // Difference in milliseconds
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

// 날짜를 문자열로 변환하는 유틸 함수
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // 월 이름 약어 (Jan, Feb, Mar, ...)
    year: "numeric", // 연도 (2021)
    day: "numeric", // 일 (1, 2, 3, ...)
    hour: "numeric", // 시간 (1, 2, 3, ...)
    minute: "numeric", // 분 (1, 2, 3, ...)
    hour12: true, // AM/PM 표시 (true: 12시간제, false: 24시간제)
  };

  // 날짜 옵션
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // 월 이름 약어 (Jan, Feb, Mar, ...)
    year: "numeric", // 연도 (2021)
    day: "numeric", // 일 (1, 2, 3, ...)
  };

  // 시간 옵션
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // 시간 (1, 2, 3, ...)
    minute: "numeric", // 분 (1, 2, 3, ...)
    hour12: true, // AM/PM 표시 (true: 12시간제, false: 24시간제)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString("en-US", dateTimeOptions);
  const formattedDate: string = new Date(dateString).toLocaleString("en-US", dateOptions);
  const formattedTime: string = new Date(dateString).toLocaleString("en-US", timeOptions);

  return { dateTime: formattedDateTime, dateOnly: formattedDate, timeOnly: formattedTime };
};

// 주문 이메일에 ID를 포맷팅하는 유틸
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

type FilterParams = {
  q?: string;
  category?: string;
  tag?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

// ✅ 검색 페이지에서 URL 파라미터를 변경하는 유틸 정의
export const getFilterUrl = ({
  params,
  category,
  tag,
  sort,
  price,
  rating,
  page,
}: {
  params: FilterParams;
  tag?: string;
  category?: string;
  sort?: string;
  price?: string;
  rating?: string;
  page?: string;
}) => {
  // 기존의 URL 파라미터를 가져온다.
  const newParams = { ...params };

  // 새로운 필터 값이 있다면 복사한 URL 파라미터를 변경한다.
  if (category) newParams.category = category;
  if (tag) newParams.tag = toSlug(tag);
  if (price) newParams.price = price;
  if (rating) newParams.rating = rating;
  if (page) newParams.page = page;
  if (sort) newParams.sort = sort;

  // 변경된 URL 파라미터를 URL로 변환하여 반환한다.
  return `/search?${new URLSearchParams(newParams).toString()}`;
};
