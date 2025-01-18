// lib/db/seed.ts

import data from "../data";
import { connectToDatabase } from ".";
import Product from "./models/product.model";
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import User from "./models/user.model";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

const main = async () => {
  try {
    // (2). 미리 정의된 상품 정보(data)를 불러온다.
    // (2.1). 샘플 사용자 정보도 가져온다. (users)
    const { products, users } = data;

    // (3). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase(process.env.MONGODB_URI);

    // (4). 기존 데이터 삭제 및 새 데이터 삽입
    await Product.deleteMany();
    const createdProducts = await Product.insertMany(products);

    // (4.1). 샘플 사용자도 삭제하고 다시 삽입한다.
    await User.deleteMany();
    const createdUser = await User.insertMany(users);

    console.log({
      createdUser,
      createdProducts,
      message: "Seeded database successfully",
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database.");
  }
};

main();
