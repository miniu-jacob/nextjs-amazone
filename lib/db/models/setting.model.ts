// lib/db/models/setting.model.ts

import { Schema, model, models, Model, Document } from "mongoose";
import { ISettingInput } from "@/types";

// 1) Document 인터페이스를 상속받아 ISetting을 정의해 준다.
export interface ISetting extends Document, ISettingInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2) Setting 모델의 스키마를 정의한다.
const settingSchema = new Schema<ISetting>(
  {
    // common
    common: {
      defaultTheme: { type: String, required: true, default: "light" },
      defaultColor: { type: String, required: true, default: "gold" },
      // pageSize: { type: Number, required: true, default: 9 },
    },
    // site
    site: {
      url: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  // 3) 스키마의 옵션을 설정한다. (timestamps - 생성일자, 수정일자 자동 생성)
  {
    timestamps: true,
  },
);

const Setting: Model<ISetting> = models.Setting || model<ISetting>("Setting", settingSchema);

export default Setting;
