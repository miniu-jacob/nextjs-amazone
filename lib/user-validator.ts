// lib/user-validator.ts

import { z } from "zod";

const UserName = z
  .string()
  .min(2, { message: "Username must be at least 2 characters" })
  .max(50, { message: "Username must be at most 30 characters" });

const Email = z.string().min(1, "Email is required").email("Email is invalid");
const Password = z.string().min(6, "Password must be at least 6 characters");
const UserRole = z.string().min(1, "Role is required");

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
