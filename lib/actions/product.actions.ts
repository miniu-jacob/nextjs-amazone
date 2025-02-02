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

// 검색에 사용하는 필터에 따른 상품을 조회하는 서버 액션 정의
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  tag: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // a). limit 기본 값 설정
  limit = limit || PAGE_SIZE;

  // b). DB 에 연결한다.
  await connectToDatabase();

  // c). 쿼리에 적용할 검색 조건을 설정한다.
  const queryFilter =
    query && query !== "all"
      ? {
          name: { $regex: query, $options: "i" },
        }
      : {};

  // d). 카테고리와 태그에 적용할 필터 조건을 설정한다.
  const categoryFilter = category && category !== "all" ? { category } : {};
  const tagFilter = tag && tag !== "all" ? { tags: tag } : {};

  // e). 별점/가격에 적용할 필터 조건을 설정한다.
  const ratingFilter =
    rating && rating !== "all"
      ? {
          avgRating: { $gte: Number(rating) }, // 별점 이상
        }
      : {};
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number(price.split("-")[0]), // 가격 이상
            $lte: Number(price.split("-")[1]), // 가격 이하
          },
        }
      : {};
  // f). 정렬 조건을 설정한다.
  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high" // 가격 낮은 순
        ? { price: 1 }
        : sort === "price-high-to-low" // 가격 높은 순
          ? { price: -1 }
          : sort === "avg-customer-review" // 별점 높은 순
            ? { avgRating: -1 } // 별점 높은 순
            : { _id: -1 }; // 최신순}

  // g). 발행된 상품만 조회한다.
  const isPublished = { isPublished: true };

  // h). 모든 조건을 합쳐서 상품을 조회한다.
  const products = await Product.find({
    ...isPublished, // 발행된 상품만 조회
    ...queryFilter, // 검색어 조건
    ...tagFilter, // 태그 조건
    ...categoryFilter, // 카테고리 조건
    ...priceFilter, // 가격 조건
    ...ratingFilter, // 별점 조건
  })
    .sort(order) // 조건에 따라 정렬
    .skip(limit * (Number(page) - 1)) // 페이지네이션을 위한 스킵
    .limit(limit) // 조회할 개수
    .lean();

  // i). 상품의 개수를 조회한다.
  const countProducts = await Product.countDocuments({
    ...isPublished, // 발행된 상품만 조회??? -> 확인 필요함
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });

  // 결과 리턴
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit), // 전체 페이지 수
    totalProducts: countProducts, // 전체 상품 수
    from: limit * (Number(page) - 1) + 1, // 현재 페이지의 첫 상품 번호
    to: limit * (Number(page) - 1) + products.length, // 현재 페이지의 마지막 상품 번호
  };
}

// 태그를 가져오는 함수를 정의한다.
export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ]);

  // 결과를 리턴한다.
  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      ) as string[]) || []
  );
}
