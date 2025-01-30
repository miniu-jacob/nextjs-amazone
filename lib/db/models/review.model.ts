// lib/db/models/review.model.ts

import { IReviewInput } from "@/types";
import { Document, Model, model, models, Schema } from "mongoose";

// 1). 인터페이스 정의 - IReview 에는 _id, 생성, 수정 날짜가 없다. 이를 추가해 준다.
export interface IReview extends Document, IReviewInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2). 스키마 정의
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: "User", // User 모델과 연결
    },
    isVerifiedPurchase: { type: Boolean, required: true, default: false },
    product: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "Product" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, minlength: 5 },
    comment: { type: String, required: true, minlength: 20 },
  },
  {
    timestamps: true,
  },
);

// 3) Review 모델 생성
const Review: Model<IReview> = models.Review || model<IReview>("Review", reviewSchema);
export default Review;
