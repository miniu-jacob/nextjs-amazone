// app/(root)/search/page.tsx

import CollapsibleOnMobile from "@/components/shared/collapsible-on-mobile";
import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import Rating from "@/components/shared/product/rating";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllProducts, getAllTags } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { getFilterUrl, toSlug } from "@/lib/utils";
import Link from "next/link";

// 검색 페이지의 파라미터를 설정한다.
type SearchPageProps = {
  searchParams: Promise<{
    q: string;
    category: string;
    tag: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
};

// 검색 조건을 보여주는 컴포넌트에 전달할 정렬 순서 정의
const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

// 열고 닫는 반응형 UI 검색 필터에서 사용할 가격 범위 옵션을 정한다.
const prices = [
  { name: "$1 to $20", value: "1-20" },
  { name: "$21 to $50", value: "21-50" },
  { name: "$51 to $1000", value: "51-1000" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 1). 검색 필터값을 받아온다.
  const newSearchParams = await searchParams;

  // 2). 받아온 검색 필터값으로부터 필터값들을 추출한다.
  const {
    q = "all", // 검색어, 기본값은 "all"
    category = "all",
    tag = "all",
    price = "all",
    rating = "all",
    sort = "all",
    page = "1",
  } = newSearchParams;

  // 3). 각 신규 검색 필터들을 객체로 저장한다.
  const params = { q, category, tag, price, rating, sort, page };

  // 4). 상품/카테고리/태그 데이터를 불러오는 함수를 추가한다.
  const categories = await getAllCategories(); // 모든 카테고리 불러오기
  const tags = await getAllTags(); // 모든 태그 불러오기
  const data = await getAllProducts({
    category,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  }); // 모든 상품 불러오기

  return (
    <div>
      {/* 검색 결과 및 선택한 필터 표시 UI */}
      <div className="mb-2 py-2 md:border-b flex-between flex-col md:flex-row">
        <div className="flex items-center">
          {/* 검색된 상품 개수를 "No Results" 또는 "1-20 of 100 results" 형식으로 표시 */}
          {data.totalProducts === 0 ? "No" : `${data.from}-${data.to} of ${data.totalProducts}`} results
          {/* 사용자가 필터를 적용한 경우에만 "for" 문구 표시 아니면 표시하지 않는다. */}
          {(q !== "all" && q !== "") ||
          (category !== "all" && category !== "") ||
          (tag !== "all" && tag !== "") ||
          rating !== "all" ||
          price !== "all"
            ? ` for `
            : null}
          {/* 개별 필터 값 표시 */}
          {q !== "all" && q !== "" && '"' + q + '"'}
          {category !== "all" && category !== "" && `  Category: ` + category}
          {tag !== "all" && tag !== "" && `  Tag:  ` + tag}
          {price !== "all" && `  Price: ` + price}
          {rating !== "all" && `  Rating: ` + rating + ` & up`} &nbsp;
          {(q !== "all" && q !== "") ||
          (category !== "all" && category !== "") ||
          (tag !== "all" && tag !== "") ||
          rating !== "all" ||
          price !== "all" ? (
            <Button variant={"link"} asChild>
              <Link href={"/search"}>Clear</Link>
            </Button>
          ) : null}
        </div>
        {/* 검색 조건 보여주기 */}
        <div>
          <ProductSortSelector sortOrders={sortOrders} sort={sort} params={params} />
        </div>
      </div>
      <div className="bg-card grid md:grid-cols-5 md:gap-4">
        {/* 상품 보여주는 UI  */}
        <CollapsibleOnMobile title="Filters">
          <div className="space-y-4">
            <div>
              <div className="font-bold">Department</div>
              <ul>
                <li>
                  <Link
                    href={getFilterUrl({ category: "all", params })}
                    // ALL 카테고리를 클릭하면 모든 상품 조회(?category=all)
                    className={`${("all" === category || "" === category) && "text-primary"}`}>
                    All
                  </Link>
                </li>
                {categories.map((c: string) => (
                  <li key={c}>
                    <Link href={getFilterUrl({ category: c, params })} className={`${c === category && "text-primary"}`}>
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* 가격 필터 */}
            <div>
              <div className="font-bold">Price</div>
              <ul>
                <li>
                  <Link href={getFilterUrl({ price: "all", params })} className={`${"all" === price && "text-primary"}`}>
                    All
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link href={getFilterUrl({ price: p.value, params })} className={`${p.value === price && "text-primary"}`}>
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* 별점 필터 (리뷰) */}
            <div>
              <div className="font-bold">Customer Review</div>
              <ul>
                <li>
                  <Link href={getFilterUrl({ rating: "all", params })} className={`${"all" === rating && "text-primary"}`}>
                    All
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl({ rating: "4", params })} className={`${"4" === rating && "text-primary"}`}>
                    <div className="flex">
                      <Rating size={4} rating={4} />
                      <span className="px-2">& Up</span>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            {/* 태그 검색 조건 */}
            <div>
              <div className="font-bold">Tag</div>
              <ul>
                <li>
                  <Link href={getFilterUrl({ tag: "all", params })} className={`${"all" === tag && "text-primary"}`}>
                    All
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link href={getFilterUrl({ tag: t, params })} className={`${toSlug(t) === tag && "text-primary"}`}>
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        {/* 상품 검색 결과 - 제목, 내용 */}
        <div className="md:col-span-4 space-y-4 ">
          <div>
            <div className="font-bold text-xl">Results</div>
            <div>Check each product page for other buying options</div>
          </div>

          {/* 상품 결과 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {data.products.length === 0 && <div>No product found</div>}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {/* 페이지네이션 */}
          {data.totalPages > 1 && <Pagination page={page} totalPages={data.totalPages} />}
        </div>
      </div>
    </div>
  );
}
