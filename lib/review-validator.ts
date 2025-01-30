// lib/review-validator.ts

import { z } from "zod";

// Common
const MongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID" });

export const ReviewInputSchema = z.object({
  product: MongoId, // Product ID - 제품 아이디
  user: MongoId, // User ID - 사용자 아이디
  isVerifiedPurchase: z.boolean(), // 구매 확인 여부
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }), // 리뷰 제목
  comment: z.string().min(20, { message: "Comment must be at least 20 characters long" }), // 리뷰 내용
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"), // 별점
})
