// lib/db/models/user.model.ts

import { IUserInput } from "@/types";
import { Schema, Document, models, Model, model } from "mongoose";

export interface IUser extends Document, IUserInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt 필드를 자동으로 채운다.
  },
);

// 모델 캐싱: 동일한 이름의 모델이 이미 존재하면 캐싱된 모델을 반환(사용). 존재하지 않을 경우 새 모델을 생성
const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
