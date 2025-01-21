// lib/db/models/order.model.ts

import { IOrderInput } from "@/types";
import { model, Model, models, Schema } from "mongoose";

export interface IOrder extends Document, IOrderInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// DB 컬렉션에 저장될 데이터의 형태를 스키마로 정의한다.
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: "User", // User 컬렉션과 연결
      required: true, // 필수값
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId, // 상품 ID
          ref: "Product", // Product 컬렉션과 연결
          required: true, // 필수값
        },
        clientId: { type: String, required: true }, // 클라이언트 ID
        name: { type: String, required: true }, // 상품명
        slug: { type: String, required: true }, // 상품 슬러그
        category: { type: String, required: true }, // 상품 카테고리
        price: { type: Number, required: true }, // 상품 가격
        countInStock: { type: Number, required: true }, // 재고 수량
        quantity: { type: Number, required: true }, // 주문 수량
        size: { type: String }, // 상품 사이즈
        color: { type: String }, // 상품 색상
      },
    ],
    // 배송 주소
    shippingAddress: {
      fullName: { type: String, required: true }, // 수령인 이름
      street: { type: String, required: true }, // 도로명 주소
      city: { type: String, required: true }, // 시/군/구
      postalCode: { type: String, required: true }, // 우편번호
      country: { type: String, required: true }, // 국가
      province: { type: String, required: true }, // 도/주
      phone: { type: String, required: true }, // 전화번호
    },
    // 결제 및 기타 정보
    expectedDeliveryDate: { type: Date, required: true }, // 예상 배송일
    paymentMethod: { type: String, required: true }, // 결제 수단
    paymentResult: { id: String, status: String, email_address: String }, // 결제 결과
    itemsPrice: { type: Number, required: true }, // 상품 가격
    shippingPrice: { type: Number, required: true }, // 배송비
    taxPrice: { type: Number, required: true }, // 세금
    totalPrice: { type: Number, required: true }, // 총 가격
    isPaid: { type: Boolean, required: true, default: false }, // 결제 완료 여부
    paidAt: { type: Date }, // 결제 일시
    isDelivered: { type: Boolean, required: true, default: false }, // 배송 완료 여부
    deliveredAt: { type: Date }, // 배송 일시
    createdAt: { type: Date, default: Date.now }, // 생성일
  },
  {
    timestamps: true, // createdAt, updatedAt 필드를 자동으로 추가
  },
);

// 주문 모델 생성
const Order = (models.Order as Model<IOrder>) || model<IOrder>("Order", orderSchema);

export default Order;
