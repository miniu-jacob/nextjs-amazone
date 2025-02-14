// lib/constants.ts

// 세금 비율
export const TAX_PRICE = 0.1;

// 서버 URL 등록
export const SENDER_NAME = process.env.SENDER_NAME || "support";
export const SENDER_EMAIL = process.env.SENDER_EMAIL || "support@miniu.kr";

// Admin Dashboard 사용자 정보 변경 시 필요한 사용자 권한을 설정한다. (owner 를 추가해 줬다. -> SuperUser 권한)
export const USER_ROLES = ["admin", "user", "owner"];
export const COLORS = ["Gold", "Green", "Red"];
export const THEMES = ["Light", "Dark", "System"];

export const FREE_SHIPPING_MIN_PRICE = 0.15;
