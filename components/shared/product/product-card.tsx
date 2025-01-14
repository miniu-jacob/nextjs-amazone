// components/shared/product/product-card.tsx

import { IProduct } from "@/lib/db/models/product.model";
import Link from "next/link";
import ImageHover from "./image-hover";
import Image from "next/image";
import Rating from "./rating";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import AddToCart from "./add-to-cart";

type ProductCardProps = {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
};

const ProductCard = ({ product, hideBorder = false, hideDetails = false, hideAddToCart = false }: ProductCardProps) => {
  // (1). 상품 이미지에 대한 랜더링을 처리하는 컴포넌트를 정의한다.
  const ProductImage = () => (
    // (a). 이미지가 두 개 이상인 경우 첫 번째 이미지를 사용
    <Link href={`/product/${product.slug}`}>
      <div className="relative h-52">
        {/* 이미지가 2개인 경우 */}
        {product.images.length > 1 ? (
          // 이미 정의한 Image Hover 컴포넌트를 불러와서 사용해 준다.
          // 매개변수는 이미지의 경로, 호버 시 이미지의 경로, 이미지의 대체 텍스트를 전달한다.
          <ImageHover src={product.images[0]} hoverSrc={product.images[1]} alt={product.name} />
        ) : (
          // 이미지가 1개인 경우
          <div className="relative h-52">
            <Image src={product.images[0]} alt={product.name} fill sizes="80vw" className="object-contain" />
          </div>
        )}
      </div>
    </Link>
  );

  //  (2). 상품 상세 정보를 랜더링하는 컴포넌트를 정의한다.
  const ProductDetails = () => (
    <div className="flex-1 space-y-2">
      {/* ### 1). 브랜드 이름 노출 */}
      <p className="font-bold">{product.brand}</p>

      {/* ### 2). 상품 이름 노출 */}
      <Link
        href={`/product/${product.slug}`}
        className="overflow-hidden text-ellipsis"
        // -webkit-box : 요소를 WebKit 전용의 flexbox-like 컨테이너로 설정한다.
        // 이는 브라우저가 텍스트를 라인 단위로 배치하도록 지시한다.
        // WebKitLineClamp : 요소의 텍스트를 최대 몇 줄까지 표시할지 설정한다.
        // WebKitBoxOrient : 요소의 텍스트를 세로로 배치할지 가로로 배치할지 설정한다.
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {product.name}
      </Link>

      {/* 별점, 리뷰 */}
      <div className="flex gap-2 justify-center">
        {/* 별점 컴포넌트 랜더링 */}
        <Rating rating={product.avgRating} />
        {/* 리뷰 숫자 포맷팅 */}
        <span>({formatNumber(product.numReviews)})</span>
      </div>
      {/* 가격 정보 랜더링 */}
      <ProductPrice isDeal={product.tags.includes("todays-deal")} price={product.price} listPrice={product.listPrice} forListing />
    </div>
  );

  // (2.5). 장바구니 추가 버튼을 정의해 준다.
  const AddButton = () => (
    <div className="w-full text-center">
      <AddToCart
        minimal
        item={{
          clientId: generateId(), // 임의의 클라이언트 아이디 생성
          product: product._id, // 상품 아이디
          size: product.sizes[0], // 사이즈
          color: product.colors[0], // 컬러
          countInStock: product.countInStock, // 재고 수량
          name: product.name, // 상품 이름
          slug: product.slug, // 상품 슬러그
          category: product.category, // 상품 카테고리
          price: round2(product.price), // 상품 가격
          quantity: 1, // 자동 추가이기 때문에 수량은 1로 설정한다.
          image: product.images[0], // 상품 이미지
        }}
      />
    </div>
  );

  // (3). 상품 카드에 대한 전체 구조를 정의한다.
  return hideBorder ? (
    // (a). 테두리가 없는 경우 > 세로 정렬
    <div className="flex flex-col">
      <ProductImage />
      {/* 상세 페이지 노출인 경우 */}
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails />{" "}
          </div>
          {/* 장바구니 버튼 추가 */}
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card className="flex flex-col">
      <CardHeader className="p-3">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="p-3 flex-1 text-center">
            <ProductDetails />
          </CardContent>
          {/* 이 경우는 어떤 경우지?  */}
          <CardFooter className="p-3">{!hideAddToCart && <AddButton />}</CardFooter>
        </>
      )}
    </Card>
  );
};

export default ProductCard;
