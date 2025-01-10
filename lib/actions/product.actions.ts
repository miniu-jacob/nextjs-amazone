// lib/actions/product.actions.ts

"use server";

import { connectToDatabase } from "../db";
import Product, { IProduct } from "../db/models/product.model";

// (1). 모든 카테고리를 조회한다.
export async function getAllCategories() {
  // (a). DB 에 연결한다.
  await connectToDatabase();

  // (b). 카테고리를 조회한다. 단, 카테고리 중복 제거를 위해 distinct() 메서드를 사용한다.
  // 또한 발행된 상품(isPublished 필드가 true 인 제품)만 조회한다.
  const categories = await Product.find({ isPublished: true }).distinct("category");
  return categories;
}

// (2). 특정 카테고리에 속한 상품을 조회한다.
// 매개변수로는 태그 정보와 조회할 상품의 개수를 선택적으로 받는다.
export async function getProductsForCard({ tag, limit = 4 }: { tag: string; limit?: number }) {
  // (a). DB 에 연결한다.
  await connectToDatabase();

  // (b). 태그에 해당하는 상품을 조회한다.
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ["/product/", "$slug"] },
      image: { $arrayElemAt: ["$images", 0] },
    },
  )
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as {
    name: string;
    href: string;
    image: string;
  }[];
}

// (3). 슬라이더에 사용할 상품을 조회하는 서버 액션
// 매개변수는 태그 정보와 조회할 상품의 개수를 선택적으로 받는다.
export async function getProductsByTag({ tag, limit = 10 }: { tag: string; limit?: number }) {
  // (a). DB 에 연결한다.
  await connectToDatabase();
  const products = await Product.find({ tags: { $in: [tag] }, isPublished: true })
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}
