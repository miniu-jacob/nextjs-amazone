// lib/user-validator.ts

import { z } from "zod";

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
