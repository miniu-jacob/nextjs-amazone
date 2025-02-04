// app/admin/overview/table-chart.tsx

"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { getMonthName } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type TableChartProps = {
  labelType: "month" | "product";
  data: {
    label: string; // 월 또는 제품 이름
    image?: string; // 제품 이미지 (월별 데이터에는 없음)
    value: number; // 총 판매량 또는 매출 금액
    id?: string; // 제품 ID (월별 데이터에는 없음)
  }[];
};

interface ProgressBarProps {
  value: number; // 퍼센트 값 (0-100)
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const boundedValue = Math.min(100, Math.max(0, value)); // 0-100 사이 값으로 제한

  return (
    <div className="relative w-full h-4 overflow-hidden">
      <div
        className="bg-primary h-full transition-all duration-300 rounded-lg"
        style={{
          width: `${boundedValue}%`, // 퍼센트 값을 width로 변환
          float: "left", // 오른쪽 정렬 (오른쪽에서 왼쪽으로 채워짐)
        }}
      />
    </div>
  );
};

export default function TableChart({
  labelType = "month", // 기본값은 월별
  data = [], // 기본값은 빈 배열
}: TableChartProps) {
  // 최대값을 찾는다.
  const max = Math.max(...data.map((item) => item.value)); // data 배열에서 value 값만 추출하여 최대값 찾기
  const dataWithPercentage = data.map((x) => ({
    ...x,
    // getMonthName(x.label) 함수를 사용하여 "2025/01" -> "January" 형태로 변환
    label: labelType === "month" ? getMonthName(x.label) : x.label, // 월별 데이터인 경우 월 이름으로 변환
    percentage: Math.round((x.value / max) * 100), // 최대값 대비 비율을 퍼센트로 변환
  }));

  return (
    <div className="space-y-3">
      {dataWithPercentage.map(({ label, id, value, image, percentage }) => (
        <div className="grid grid-cols-[100px_1fr_80px] md:grid-cols-[250px_1fr_80px] gap-2 space-y-4" key={label}>
          {/* 제품 이미지 또는 월별 텍스트 */}
          {image ? (
            <Link className="flex items-end" href={`/admin/products/${id}`}>
              <Image
                className="rounded border aspect-square object-scale-down max-w-full h-auto mx-auto mr-1"
                src={image.startsWith("/") ? image : `${image}`}
                alt={label}
                width={36}
                height={36}
              />
              <p className="text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis">{label}</p>
            </Link>
          ) : (
            <div className="flex items-end text-sm">{label}</div>
          )}

          {/* PROGRESS BAR */}
          <ProgressBar value={percentage} />

          {/* 매출 금액 */}
          <div className="text-sm text-right flex items-center">
            <ProductPrice price={value} plain />
          </div>
        </div>
      ))}
    </div>
  );
}
