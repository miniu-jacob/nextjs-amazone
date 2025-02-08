// lib/user-validator.ts

import { z } from "zod";

// Common
const MongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID" });

const UserName = z
  .string()
  .min(2, { message: "Username must be at least 2 characters" })
  .max(50, { message: "Username must be at most 30 characters" });

const Email = z.string().min(1, "Email is required").email("Email is invalid");
const Password = z.string().min(6, "Password must be at least 6 characters");
// role을 소문자로 변환
const UserRole = z
  .string()
  .default("user") // 기본값은 "user"
  .transform((value) => value.toLowerCase()) // 입력값을 소문자로 변환
  .refine((value) => ["user", "admin", "owner"].includes(value), {
    message: "Invalid role. Please Input right roles.",
  });

// 유저 이름 변경을 위한 스키마
export const UserNameSchema = z.object({
  name: UserName,
});

export const UserInputSchema = z.object({
  name: UserName,
  email: Email,
  image: z.string().optional(),
  emailVerified: z.boolean(),
  role: UserRole,
  password: Password,
  paymentMethod: z.string().min(1, "Payment method is required"),
  address: z.object({
    fullName: z.string().min(1, "Full name is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
  }),
});

export const UserSignInSchema = z.object({
  email: Email,
  password: Password,
});

// 회원가입 유효성 검사 스키마
// UserSignInSchema를 확장하여 회원가입 시 추가로 필요한 필드를 추가
export const UserSignUpSchema = UserSignInSchema.extend({
  name: UserName,
  confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Admin 대시보드 > 유저 정보 변경을 위한 검증 스키마
export const UserUpdateSchema = z.object({
  _id: MongoId,
  name: UserName,
  email: Email,
  role: UserRole,
});
