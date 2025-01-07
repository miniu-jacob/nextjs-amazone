// lib/db/models/product.model.ts

import { IProductInput } from "@/types";
import { Document, model, Model, models, Schema } from "mongoose";

export interface IProduct extends Document, IProductInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    images: [String], // 이미지는 배열로 받는다.
    brand: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    listPrice: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    tags: { type: [String], default: ["new arrival"] },
    colors: { type: [String], default: ["White", "Red", "Black"] },
    sizes: { type: [String], default: ["XS", "S", "M", "L", "XL"] },
    avgRating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    ratingDistribution: [
      {
        rating: { type: Number, required: true },
        count: { type: Number, required: true },
      },
    ],
    numSales: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, required: true, default: false },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ProductSchema 로 정의된 스키마를 기반으로 MongoDB 컬렉션과 상호작용할 수 있는 모델을 생성한다.
// 모델은 MongoDB 컬렉션을 조작할 수 있는 인터페이스를 제공한다.
const Product = (models.Product as Model<IProduct>) || model<IProduct>("Product", productSchema);

export default Product;
