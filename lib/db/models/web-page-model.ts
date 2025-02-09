// lib/db/models/web-page-model.ts

import { IWebPageInput } from "@/types";
import { Document, Model, Schema, model, models } from "mongoose";

// ! Document는 mongoose 에서 제공하는 것을 불러와야 한다. !!!!!
export interface IWebPage extends Document, IWebPageInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 컬렉션 구조 정의 > 스키마 정의
const webPageSchema = new Schema<IWebPage>(
  // 구조 정의
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, required: true, default: false },
  },

  // 옵션
  {
    timestamps: true,
  },
);

const WebPage: Model<IWebPage> = models.WebPage || model<IWebPage>("WebPage", webPageSchema);

export default WebPage;
