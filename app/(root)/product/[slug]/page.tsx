// app/(root)/product/[slug]/page.tsx

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import AddToBrowsingHistory from "@/components/shared/product/add-to-browsing-history";
import ProductGallery from "@/components/shared/product/product-gallery";
import ProductOptions from "@/components/shared/product/product-options";
import ProductPrice from "@/components/shared/product/product-price";
import ProductSlider from "@/components/shared/product/product-slider";
import Rating from "@/components/shared/product/rating";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug, getRelatedProductsByCategory } from "@/lib/actions/product.actions";

// (1). 메타데이터를 생성하는 함수를 정의한다.
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  // (a). slug 를 받아온다.
  const params = await props.params;

  // (b). 받아온 slug로 상품 정보를 조회하는 서버 액션을 호출한다.
  const product = await getProductBySlug(params.slug);

  // (c). 조회된 상품이 없다면 에러 반환
  if (!product) throw new Error("Product not found");

  // (d). 상품 정보를 반환한다.
  return {
    title: product.name,
    description: product.description,
  };
}

// (2). 상품 상세 페이지를 생성하는 함수를 정의한다.
export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page: string; color: string; size: string }>;
}) {
  // (a). searchParams로 가져온 내용을 searchParams 변수에 넣는다.
  const searchParams = await props.searchParams;

  // (b). searchParams으로부터 page, color, size를 가져온다. 결과가 있으면 결과를 표시하고 없으면 undefined 으로 표시한다.
  const { page, color, size } = searchParams;

  // (c). props.params로 가져온 내용을 params 변수에 넣고 slug를 가져온다.
  const params = await props.params;
  const { slug } = params;

  // (d). slug를 통해 상품 정보를 조회한다.
  const product = await getProductBySlug(slug);

  // (e). 관련 있는 상품(관련 상품)을 조회한다.
  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product.id,
    page: Number(page || 1),
  });

  return (
    <div>
      {/* 사용자가 본 상품을 히스토리에 추가하기 */}
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* 이미지 영역 */}
          <div className="col-span-2">
            <ProductGallery images={product.images} />
          </div>
          {/* 브랜드 및 상품 정보 노출 영역 */}
          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              {/* 브랜드 이름 및 카테고리 */}
              <p className="p-medium-16 rounded-full bg-gray-500/10 text-gray-500">
                Brand {product.brand} {product.category}
              </p>
              <h1 className="font-bold text-lg lg:text-xl">{product.name}</h1>
              {/* 별점 */}
              <div className="flex items-center gap-2">
                <span>{product.avgRating.toFixed(1)}</span>
                <Rating rating={product.avgRating} />
                <span>{product.numReviews} ratings</span>
              </div>
              <Separator />
              {/* 가격 정보 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <ProductPrice price={product.price} listPrice={product.listPrice} isDeal={product.tags.includes("todays-deal")} />
                </div>
              </div>
            </div>
            {/* 컬러, 사이즈 */}
            <div>
              <ProductOptions product={product} size={size || product.sizes[0]} color={color || product.colors[0]} />
            </div>
            <Separator className="my-2" />
            {/* 상품 상세 정보 */}
            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-gray-600">Description:</p>
              <p className="p-medium-16 lg:p-regular-18">{product.description}</p>
            </div>
          </div>
          {/* 카드 - 재고 상태 표시 */}
          <div>
            <Card>
              <CardContent className="p-4 flex flex-col gap-4">
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">{`Only ${product.countInStock} left in stock - order soon`}</div>
                )}
                {product.countInStock !== 0 ? (
                  <div className="text-green-700 text-xl">In Stock</div>
                ) : (
                  <div className="text-destructive text-xl">Out of Stock</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* 두 번째 섹션 */}
      <section className="mt-10">
        <ProductSlider products={relatedProducts.data} title={`Best Sellers in ${product.category}`} />
      </section>
      {/* 세 번째 섹션 - Browsing history */}
      <section>
        <BrowsingHistoryList className="mt-10" />
      </section>
    </div>
  );
}
