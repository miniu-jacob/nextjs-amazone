// components/shared/product/product-price.tsx
"use client";

import useSettingStore from "@/hooks/use-setting-store";
import { useLocale, useTranslations } from "next-intl";
import { cn, round2 } from "@/lib/utils";

type ProductPriceProps = {
  price: number; // 현재 판매 가격
  isDeal?: boolean; // 특별 할인 여부
  listPrice?: number; // 정가 (기본값은 0)
  className?: string; // 추가 클래스 적용
  forListing?: boolean; // 상품 목록 페이지인지 여부(UI 랜더링 플래그)
  plain?: boolean; // 가격만 간단히 표시할지 여부
};

const ProductPrice = ({ price, className, listPrice = 0, isDeal = true, forListing = true, plain = false }: ProductPriceProps) => {
  const { getCurrency } = useSettingStore(); // 전역 설정을 가져온다.
  const currency = getCurrency(); // getCurrency 함수를 호출하여 통화 단위를 가져온다.
  const t = useTranslations(); // 다국어 지원을 위한 useTranslations 훅을 가져온다.
  const locale = useLocale();

  const convertedPrice = round2(currency.convertRate * price); // 가격을 통화 단위에 맞게 변환한다.
  const convertedListPrice = round2(currency.convertRate * listPrice); // 정가를 통화 단위에 맞게 변환한다.

  // const format = useFormatter(); // useFormatter 훅을 가져온다.
  // const discountPercent = Math.round(100 - (convertedPrice / convertedListPrice) * 100); // 할인율을 계산한다.

  // (1). 할인율을 계산한다.

  /*
  // (2). 가격을 정수와 소수로 분리한다.
  const stringValue = convertedPrice.toString();
  // 문자열에 . (분리)가 포함되어 있는지 확인한다.
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".") // 소수점이 있는 경우 분리한다.
    : [stringValue, ""]; // 소수점이 없는 경우 빈 문자열로 초기화 */

  // 통화에 따라 소수점 설정 다르게 적용
  const fractionDigits = ["KRW", "VND"].includes(currency.code)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  // 천단위 콤마와 통화 코드 적용
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.code,
    ...fractionDigits,
    currencyDisplay: "narrowSymbol",
  })
    .format(convertedPrice)
    .replace(/(\D)(\d)/, "$1 $2");

  const formattedListPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
    .format(convertedListPrice)
    .replace(/(\D)(\d)/, "$1 $2");

  const discountPercent = Math.round(100 - (convertedPrice / convertedListPrice) * 100);

  // (3). plain 플래그가 true 인 경우 가격만 표시한다.
  return plain ? (
    // formatCurrency(price)
    // format.number(convertedPrice, {
    //   style: "currency", // 통화 스타일로 표시
    //   currency: currency.code, // 통화 코드를 적용
    //   currencyDisplay: "narrowSymbol", // 통화 기호를 간략하게 표시
    // })
    formattedPrice
  ) : convertedListPrice == 0 ? (
    <div className={cn("text-xl", className)}>{formattedPrice}</div>
  ) : isDeal ? (
    // 할인이 적용된 경우
    <div className="space-y-2">
      <div className="flex justify-center items-center gap-2">
        <span className="bg-red-700 rounded-sm p-1 text-white text-sm font-semibold">
          {discountPercent}% {t("Product.Off")}
        </span>
        <span className="text-red-700 text-xs font-bold">{t("Product.Limited time deal")}</span>
      </div>
      {/* 가격 표시 부분 */}
      <div className={`flex ${forListing && "justify-center"} items-center gap-2`}>
        <div className={cn("text-xl", className)}>{formattedPrice}</div>
        <div className="text-muted-foreground text-xs py-2">
          {t("Product.Was")}: <span className="line-through">{formattedListPrice}</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="">
      <div className="flex justify-center gap-3">
        <div className="text-2xl text-orange-700">-{discountPercent}%</div>
        <div className={cn("text-xl", className)}>{formattedPrice}</div>
      </div>
      <div className="text-muted-foreground text-xs py-2">
        {t("Product.List price")}: <span className="line-through">{formattedListPrice}</span>
      </div>
    </div>
  );
};

export default ProductPrice;
