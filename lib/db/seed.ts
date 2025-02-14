/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/db/seed.ts

import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import { connectToDatabase } from ".";
import data from "../data";
import Product from "./models/product.model";
import User from "./models/user.model";
import Review from "./models/review.model";
import Order from "./models/order.model";
import { IOrderInput, OrderItem, ShippingAddress } from "@/types";
import { calculateFutureDate, calculatePastDate, generateId, round2 } from "../utils";
import Setting from "./models/setting.model";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const main = async () => {
  try {
    // (2). 미리 정의된 상품 정보(data)를 불러온다.
    // (2.1). 샘플 사용자 정보도 가져온다. (users)
    const { products, users, reviews, settings } = data;

    // (3). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase(process.env.MONGODB_URI);

    // (4.1). 유저 데이터 삭제
    await User.deleteMany();
    const createdUser = await User.insertMany(users);

    // 설정 데이터 삭제 및 삽입
    await Setting.deleteMany();
    const createSetting = await Setting.insertMany(settings);

    // (4.2). 상품 데이터 삭제
    await Product.deleteMany();
    const createdProducts = await Product.insertMany(
      products.map((x) => ({ ...x, _id: undefined })), // 상품 ID를 제거한다.
    );

    // (4.3). 리뷰 데이터 삭제
    await Review.deleteMany();
    // (5.1). 리뷰를 초기화한다.
    const rws = []; // 리뷰를 저장할 배열을 생성한다.

    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0;
      const { ratingDistribution } = createdProducts[i]; // 별점 분포를 가져온다.
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++; // 리뷰 수를 증가시킨다.
          rws.push({
            ...reviews.filter((x) => x.rating === j + 1)[
              x % reviews.filter((x) => x.rating === j + 1).length // 리뷰 수를 나눈 나머지를 이용하여 리뷰를 선택한다.
            ],
            isVerifiedPurchase: true, // 확인된 구매 여부
            product: createdProducts[i]._id, // 제품 ID
            user: createdUser[x % createdUser.length]._id, // 사용자 ID
            updatedAt: Date.now(), // 업데이트 일자
            createdAt: Date.now(), // 생성 일자
          });
        }
      }
    }
    // (5.2). 리뷰를 DB에 넣는다.
    const createdReviews = await Review.insertMany(rws);

    // (5.3). 샘플 주문 만들기
    await Order.deleteMany();
    const orders = [];
    for (let i = 0; i < 200; i++) {
      orders.push(
        await generateOrder(
          i,
          createdUser.map((x) => x._id),
          createdProducts.map((x) => x._id),
        ),
      );
    }
    const createdOrders = await Order.insertMany(orders);

    console.log({
      createdUser,
      createdProducts,
      createdReviews, // 리뷰 정보
      createdOrders, // 주문 정보 (샘플)
      createSetting, // 설정 정보
      message: "Seeded database successfully",
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database.");
  }
};

// 샘플 주문 만드는 함수
const generateOrder = async (i: number, users: any, products: any): Promise<IOrderInput> => {
  const product1 = await Product.findById(products[i % products.length]);
  const product2 = await Product.findById(
    products[i % products.length >= products.length - 1 ? (i % products.length) - 1 : (i % products.length) + 1],
  );

  const product3 = await Product.findById(
    products[i % products.length >= products.length - 2 ? (i % products.length) - 2 : (i % products.length) + 2],
  );

  if (!product1 || !product2 || !product3) throw new Error("Product not found");

  const items = [
    {
      clientId: generateId(),
      product: product1._id,
      name: product1.name,
      slug: product1.slug,
      quantity: 1,
      image: product1.images[0],
      category: product1.category,
      price: product1.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product2._id,
      name: product2.name,
      slug: product2.slug,
      quantity: 2,
      image: product2.images[0],
      category: product2.category,
      price: product2.price,
      countInStock: product2.countInStock,
    },
    {
      clientId: generateId(),
      product: product3._id,
      name: product3.name,
      slug: product3.slug,
      quantity: 3,
      image: product3.images[0],
      category: product3.category,
      price: product3.price,
      countInStock: product3.countInStock,
    },
  ];

  const order = {
    user: users[i % users.length],
    items: items.map((item) => ({ ...item, product: item.product })),
    shippingAddress: data.users[i % users.length].address,
    paymentMethod: data.users[i % users.length].paymentMethod,
    isPaid: true,
    isDelivered: true,
    paidAt: calculatePastDate(i),
    deliveredAt: calculatePastDate(i),
    createdAt: calculatePastDate(i),
    expectedDeliveryDate: calculateFutureDate(i % 2),
    ...calcDeliveryDateAndPriceForSeed({
      items: items,
      shippingAddress: data.users[i % users.length].address,
      deliveryDateIndex: i % 2,
    }),
  };
  return order;
};

export const calcDeliveryDateAndPriceForSeed = ({
  items,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}) => {
  const { availableDeliveryDates } = data.settings[0];
  const itemsPrice = round2(items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  const deliveryDate = availableDeliveryDates[deliveryDateIndex === undefined ? availableDeliveryDates.length - 1 : deliveryDateIndex];

  const shippingPrice = deliveryDate.shippingPrice;

  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + (shippingPrice ? round2(shippingPrice) : 0) + taxPrice ? round2(taxPrice) : 0);

  return {
    availableDeliveryDates,
    deliveryDateIndex: deliveryDateIndex === undefined ? availableDeliveryDates.length - 1 : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

main();
