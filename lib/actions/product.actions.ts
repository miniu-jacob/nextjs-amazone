// lib/actions/product.actions.ts

"use server";

import { PAGE_SIZE } from "../constants";
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

// (4). 특정 상품을 조회하는 서버 액션(by slug)
export async function getProductBySlug(slug: string) {
  // (a). DB 에 연결한다.
  await connectToDatabase();
  // (b). slug 에 해당하는 상품을 조회한다.
  const product = await Product.findOne({ slug, isPublished: true });
  // (c). 상품이 존재하지 않을 경우 에러를 발생시킨다.
  if (!product) throw new Error("상품을 찾을 수 없습니다");
  // (d). 상품을 반환한다.
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

type getRelatedProductsByCategoryProps = {
  category: string;
  productId: string;
  limit?: number;
  page: number;
};

// (5). 같은 카테고리에 속한 상품을 조회하는 서버 액션(by category)
// 매개변수로는 카테고리, 제외할 상품의 ID, 조회할 제품의 개수, 페이지 등을 받는다.
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = PAGE_SIZE,
  page = 1,
}: getRelatedProductsByCategoryProps) {
  // (a). DB 에 연결한다.
  await connectToDatabase();

  // (b). 페이지네이션을 위한 스킵할 개수를 정의한다. (page -1 ) * limit
  const skipAmount = (Number(page) - 1) * limit;

  // (c). 검색할 조건을 지정한다.
  const conditions = { isPublished: true, category, _id: { $ne: productId } };

  // (d). 상품을 조회한다.
  const products = await Product.find(conditions).sort({ numSales: "desc" }).skip(skipAmount).limit(limit);

  // (e). 상품의 개수를 조회한다.
  const productsCount = await Product.countDocuments(conditions);

  // (f). 상품을 리턴하고 페이지네이션 정보를 함께 반환한다.
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  };
}
