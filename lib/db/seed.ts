// lib/db/seed.ts

import data from "../data";
import { connectToDatabase } from ".";
import Product from "./models/product.model";
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import User from "./models/user.model";
import Review from "./models/review.model";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const main = async () => {
  try {
    // (2). 미리 정의된 상품 정보(data)를 불러온다.
    // (2.1). 샘플 사용자 정보도 가져온다. (users)
    const { products, users, reviews } = data;

    // (3). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase(process.env.MONGODB_URI);

    // (4). 기존 데이터 삭제 및 새 데이터 삽입
    await Product.deleteMany();
    const createdProducts = await Product.insertMany(products);

    // (4.1). 샘플 사용자도 삭제하고 다시 삽입한다.
    await User.deleteMany();
    const createdUser = await User.insertMany(users);

    // (5). 기존의 리뷰를 삭제한다.
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

    console.log({
      createdUser,
      createdProducts,
      createdReviews, // 리뷰 정보
      message: "Seeded database successfully",
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database.");
  }
};

main();
