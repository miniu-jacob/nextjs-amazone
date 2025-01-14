// app/api/products/browsing-history/route.ts

import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/db/models/product.model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  // (1). 들어온 요청 파라미터들을 변수에 넣는다.
  const listType = req.nextUrl.searchParams.get("type") || "history";
  const productIdsParam = req.nextUrl.searchParams.get("ids");
  const categoriesParam = req.nextUrl.searchParams.get("categories");

  // (2). 값이 없는 경우 빈 배열을 반환한다.
  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([]);
  }

  // (3). ids와 categories를 콤마로 나누어 배열로 만든다.
  const productIds = productIdsParam.split(",");
  const categories = categoriesParam.split(",");

  // clog.info("[GET] productIds: ", productIds);

  // (4). DB 검색 조건을 설정한다.
  const filter =
    listType === "history"
      ? // (a). 사용자가 본 상품을 조회하는 경우 productIds 가 DB 에 있어야 한다.
        {
          _id: { $in: productIds },
        }
      : // (b). 관련 상품을 조회하는 경우 카테고리는 같지만 상품 목록에는 없어야 한다. 즉, productIds에 없는 상품을 조회한다.
        { category: { $in: categories }, _id: { $nin: productIds } };

  // (5). DB 에서 검색 조건으로 상품을 조회한다.
  await connectToDatabase();
  const products = await Product.find(filter);

  // (6). 타입이 사용자가 본 상품(history)인 경우 조회된 상품을 productIds 순서대로 정렬한다.
  if (listType === "history")
    return NextResponse.json(products.sort((a, b) => productIds.indexOf(a._id.toString()) - productIds.indexOf(b._id.toString())));

  return NextResponse.json(products);
};
