// components/shared/product/product-price.tsx

import { cn, formatCurrency } from "@/lib/utils";

type ProductPriceProps = {
  price: number; // 현재 판매 가격
  isDeal?: boolean; // 특별 할인 여부
  listPrice?: number; // 정가 (기본값은 0)
  className?: string; // 추가 클래스 적용
  forListing?: boolean; // 상품 목록 페이지인지 여부(UI 랜더링 플래그)
  plain?: boolean; // 가격만 간단히 표시할지 여부
};

const ProductPrice = ({ price, className, listPrice = 0, isDeal = true, forListing = true, plain = false }: ProductPriceProps) => {
  // (1). 할인율을 계산한다.
  const discountPercent = Math.round(100 - (price / listPrice) * 100);

  // (2). 가격을 정수와 소수로 분리한다.
  const stringValue = price.toString();
  // 문자열에 . (분리)가 포함되어 있는지 확인한다.
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".") // 소수점이 있는 경우 분리한다.
    : [stringValue, ""]; // 소수점이 없는 경우 빈 문자열로 초기화

  // (3). plain 플래그가 true 인 경우 가격만 표시한다.
  return plain ? (
    formatCurrency(price)
  ) : listPrice == 0 ? (
    <div className={cn("text-3xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">{floatValue}</span>
    </div>
  ) : isDeal ? (
    // 할인이 적용된 경우
    <div className="space-y-2">
      <div className="flex justify-center items-center gap-2">
        <span className="bg-red-700 rounded-sm p-1 text-white text-sm font-semibold">{discountPercent}% Off</span>
        <span className="text-red-700 text-xs font-bold">Limited time deal</span>
      </div>
      {/* 가격 표시 부분 */}
      <div className={`flex ${forListing && "justify-center"} items-center gap-2`}>
        <div className={cn("text-3xl", className)}>
          <span className="text-xs align-super">$</span>
          {intValue}
          <span className="text-xs align-super">{floatValue}</span>
        </div>
        <div className="text-muted-foreground text-xs py-2">
          Was: <span className="line-through">{formatCurrency(listPrice)}</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="">
      <div className="flex justify-center gap-3">
        <div className="text-3xl text-orange-700">-{discountPercent}%</div>
        <div className={cn("text-3xl", className)}>
          <span className="text-xs align-super">$</span>
          {intValue}
          <span className="text-xs align-super">{floatValue}</span>
        </div>
      </div>
      <div className="text-muted-foreground text-xs py-2">
        List price: <span className="line-through">{formatCurrency(listPrice)}</span>
      </div>
    </div>
  );
};

export default ProductPrice;
