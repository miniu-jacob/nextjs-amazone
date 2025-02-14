// lib/db/models/setting.model.ts

import { ISettingInput } from "@/types";
import { Schema, model, models, Model, Document } from "mongoose";

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
      pageSize: { type: Number, required: true, default: 9 },
      isMaintenanceMode: { type: Boolean, required: true, default: false },
      freeShippingMinPrice: { type: Number, required: true, default: 0 },
      defaultTheme: { type: String, required: true, default: "light" },
      defaultColor: { type: String, required: true, default: "gold" },
    },
    // site
    site: {
      name: { type: String, required: true },
      url: { type: String, required: true },
      logo: { type: String, required: true },
      slogan: { type: String, required: true },
      description: { type: String, required: true },
      keywords: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      author: { type: String, required: true },
      copyright: { type: String, required: true },
      address: { type: String, required: true },
    },
    carousels: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        buttonCaption: { type: String, required: true },
      },
    ],
    availableLanguages: [
      {
        name: { type: String, required: true, set: (value: string) => Buffer.from(value).toString("utf8") },
        code: { type: String, required: true },
      },
    ],
    defaultLanguage: { type: String, required: true }, // 기본 언어
    availableCurrencies: [
      {
        name: { type: String, required: true, set: (value: string) => Buffer.from(value).toString("utf8") },
        code: { type: String, required: true },
        convertRate: { type: Number, required: true },
        symbol: { type: String, required: true, set: (value: string) => Buffer.from(value).toString("utf8") },
      },
    ],
    defaultCurrency: { type: String, required: true },
    availablePaymentMethods: [
      {
        name: { type: String, required: true },
        commission: { type: Number, required: true, default: 0 },
      },
    ],
    defaultPaymentMethod: { type: String, required: true },
    availableDeliveryDates: [
      {
        name: { type: String, required: true },
        daysToDeliver: { type: Number, required: true },
        shippingPrice: { type: Number, required: true },
        freeShippingMinPrice: { type: Number, required: true },
      },
    ],
    defaultDeliveryDate: { type: String, required: true },
  },
  // 3) 스키마의 옵션을 설정한다. (timestamps - 생성일자, 수정일자 자동 생성)
  {
    timestamps: true,
  },
);

const Setting: Model<ISetting> = models.Setting || model<ISetting>("Setting", settingSchema);

export default Setting;
