// lib/actions/product.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import Product, { IProduct } from "../db/models/product.model";
import { formatError } from "../utils";
import { IProductInput } from "@/types";
import { ProductInputSchema, ProductUpdateSchema } from "../validator";
import { z } from "zod";
import { auth } from "../auth";
import { getSetting } from "./setting.actions";

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

  // (b-1). 한글 디코딩 적용
  const decodedSlug = decodeURIComponent(slug);

  const product = await Product.findOne({ slug: decodedSlug, isPublished: true });
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
export async function getRelatedProductsByCategory({ category, productId, limit = 4, page = 1 }: getRelatedProductsByCategoryProps) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
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
  const {
    common: { pageSize },
  } = await getSetting();

  // a). limit 기본 값 설정
  limit = limit || pageSize;

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

// Admin 페이지에서 모든 상품을 조회하는 함수
// 검색에 사용하는 필터에 따른 상품을 조회하는 서버 액션 정의
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  // a). limit 기본 값 설정
  limit = limit || pageSize;

  // b). DB 에 연결한다.
  await connectToDatabase();

  // c). 쿼리에 적용할 검색 조건을 설정한다.
  const queryFilter =
    query && query !== "all"
      ? {
          name: { $regex: query, $options: "i" },
        }
      : {};

  // d). 정렬 조건을 설정한다.
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

  // e). 모든 조건을 합쳐서 상품을 조회한다.
  const products = await Product.find({
    ...queryFilter, // 검색어 조건
  })
    .sort(order) // 조건에 따라 정렬
    .skip(limit * (Number(page) - 1)) // 페이지네이션을 위한 스킵
    .limit(limit) // 조회할 개수
    .lean();

  // f). 상품의 개수를 조회한다.
  const countProducts = await Product.countDocuments({
    ...queryFilter,
  });

  // 결과 리턴
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / pageSize), // 전체 페이지 수
    totalProducts: countProducts, // 전체 상품 수
    from: pageSize * (Number(page) - 1) + 1, // 현재 페이지의 첫 상품 번호
    to: pageSize * (Number(page) - 1) + products.length, // 현재 페이지의 마지막 상품 번호
  };
}

// Admin 페이지에서 상품을 삭제하는 함수를 정의한다.
// TODO: INACTIVATE THIS FUNCTION FOR A WHILE FOR TESTING
// TODO: 테스트를 위해 비활성화 (데모 시연)
export async function deleteProduct(id: string) {
  try {
    console.log("ID", id);
    // a). DB 에 연결하고 상품의 ID를 조회해서 상품을 삭제한다.

    // await connectToDatabase();
    // const res = await Product.findByIdAndDelete(id);
    // if (!res) throw new Error("Product not found");

    // b). 상품 삭제 성공 시 revalidatePath() 함수를 사용하여 /admin/products 경로의 캐시를 갱신한다.
    revalidatePath("/admin/products");

    // c). 결과를 반환한다.
    return {
      success: true,
      message: "Product deleted successfully. For the test it will not be deleted",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Admin 상품 페이지에서 상품 생성하는 함수 정의
export async function createProduct(data: IProductInput) {
  try {
    // a). 데이터 검증
    const product = ProductInputSchema.parse(data); // 데이터는 함수 호출 시 전달된다.

    // b). DB 에 연결하고 상품을 생성한다. (Model.create() 메서드 사용)
    await connectToDatabase();
    await Product.create(product); // 상품 생성, 검증된 데이터(product)를 전달한다.

    // c). 상품 생성 성공 시 revalidatePath() 함수를 사용하여 /admin/products 경로의 캐시를 갱신한다.
    revalidatePath("/admin/products");

    // d). 결과를 반환한다.
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Admin 상품 페이지에서 상품을 업데이트하는 함수 정의
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    // TODO: 사용자의 세션을 가져와서 본인이 만든 상품인지 확인하는 로직추가
    const session = await auth();
    if (!session || session?.user.role !== "owner") throw new Error("For DEMO, only owner can update the product");

    // a). 데이터 검증
    const product = ProductUpdateSchema.parse(data);

    // b). DB 에 연결하고 상품을 업데이트한다. (Model.findByIdAndUpdate() 메서드 사용)
    await connectToDatabase();

    await Product.findByIdAndUpdate(product._id, product); // ID 로 찾고 업데이트할 내용(product)을 전달한다.

    // c). 상품 수정 성공 시 revalidatePath() 함수를 사용하여 /admin/products 경로의 캐시를 갱신한다.
    revalidatePath("/admin/products");

    // d). 결과를 반환한다.
    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Admin 상품 페이지에서 상품을 조회하는 함수 정의
export async function getProductById(productId: string) {
  // a). DB 연결 후 상품 아이디로 상품을 조회하여 JSON 형태로 반환한다.
  await connectToDatabase();
  const product = await Product.findById(productId);
  return JSON.parse(JSON.stringify(product)) as IProduct;
}
