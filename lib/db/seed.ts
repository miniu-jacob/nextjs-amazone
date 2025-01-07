// lib/db/seed.ts

import data from "../data";
import { connectToDatabase } from ".";
import Product from "./models/product.model";
import { cwd } from "process";
import { clog } from "../jlogger";
import { loadEnvConfig } from "@next/env";

// (1). .env.local 파일을 현재 작업 디렉토리에서 로드하여 환경 변수를 설정한다.
loadEnvConfig(cwd());

console.log("MONGODB_URI (process.env): ", process.env.MONGODB_URI);

const main = async () => {
  try {
    clog.log("[seed.ts] main() started");

    // (2). 미리 정의된 상품 정보(data)를 불러온다.
    const { products } = data;

    // (3). DB 에 연결한다. connectToDatabase 함수에서 이미 MONGODB_URI 환경 변수를 사용하기 때문에 인자가 필요없다.
    await connectToDatabase();
    clog.info("[seed.ts] Connected to database");

    // (4). 기존 데이터 삭제 및 새 데이터 삽입
    await Product.deleteMany();
    const createdProducts = await Product.insertMany(products);

    console.log({
      createdProducts,
      message: "Seeded database successfully",
    });
    process.exit(0);
  } catch (error) {
    clog.error(error);
    throw new Error("Failed to seed database.");
  }
};

main();
