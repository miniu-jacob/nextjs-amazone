// components/shared/product/rating-summary.tsx

"use client";

import { Progress } from "@/components/ui/progress";
import Rating from "./rating";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTranslations } from "next-intl";

type RatingSummaryProps = {
  asPopover?: boolean;
  avgRating: number;
  numReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
};

export default function RatingSummary({
  asPopover, // 팝오버 여부
  avgRating, // 평균 평점
  numReviews, // 리뷰 개수
  ratingDistribution = [], // 평점 분포
}: RatingSummaryProps) {
  const t = useTranslations("Product");

  // 별점을 백분율로 보여주는 함수를 정의한다.
  const RatingDistribution = () => {
    const ratingPercentageDistribution = ratingDistribution.map((x) => ({
      ...x, // x를 복사한다.
      percentage: Math.round((x.count / numReviews) * 100), // 별점의 백분율을 계산한다.
    }));

    return (
      <>
        {/* 별점 표시와 텍스트 */}
        <div className="flex items-center gap-1 cursor-help flex-wrap">
          <Rating rating={avgRating} />
          <span className="text-base font-semibold">
            {t("avgRating out of 5", {
              avgRating: avgRating.toFixed(1),
            })}
          </span>
        </div>
        {/* 총 리뷰 수 */}
        <div className="text-sm text-right">{t("numReviews ratings", { numReviews })}</div>
        {/* 별점 순서: 높은 점수 -> 낮은 점수 */}
        <div className="space-y-3">
          {ratingPercentageDistribution
            .sort((a, b) => b.rating - a.rating)
            .map(({ rating, percentage }) => (
              <div className="grid grid-cols-[50px_1fr_30px] gap-2 items-center" key={rating}>
                <div className="text-sm">{t("rating star", { rating })}</div>
                <Progress value={percentage} className="h-4" />
                <div className="text-sm text-right">{percentage}%</div>
              </div>
            ))}
        </div>
      </>
    );
  };

  return asPopover ? (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          {/* [&_svg] - 현재 요소의 직계 자식 요소 중 <svg> 태그에만 적용 */}
          {/* 별점 텍스트와 아이콘을 고스트 형태로 보여줌 */}
          <Button variant={"ghost"} className="px-2 [&_svg]:size-6 text-base">
            <span>{avgRating.toFixed(1)}</span>
            <Rating rating={avgRating} />
            <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex flex-col gap-2">
            <RatingDistribution />
            <Separator />
            <Link href="#reviews" className="highlight-link text-center text-sm">
              {t("See customer reviews")}
            </Link>
          </div>
        </PopoverContent>
      </Popover>
      {/* 리뷰 개수 표시와 링크 */}
      <div>
        <Link href="#reviews" className="highlight-link text-sm">
          {t("numReviews ratings", { numReviews })}
        </Link>
      </div>
    </div>
  ) : (
    <RatingDistribution />
  );
}
