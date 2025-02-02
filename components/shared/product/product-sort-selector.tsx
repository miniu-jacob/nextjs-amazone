// components/shared/product/product-sort-selector.tsx

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFilterUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProductSortSelector({
  sortOrders, // 정렬 순서
  sort, // 현재 정렬 순서
  params, // 검색 필터값
}: {
  sortOrders: { value: string; name: string }[]; // 검색 페이지에서 sortOrders 를 이렇게 정의해 주었다.
  sort: string;
  params: { q?: string; category?: string; price?: string; rating?: string; sort?: string; page?: string };
}) {
  // URL 변경을 위한 설정
  const router = useRouter();

  // Select Dropdown UI를 생성한다.
  return (
    <Select
      onValueChange={(v) => {
        router.push(getFilterUrl({ params, sort: v }));
      }}
      value={sort}>
      <SelectTrigger className="flex items-center gap-x-2 min-w-[240px]">
        <SelectValue>
          Sort By: {sortOrders.find((s) => s.value === sort) ? sort : "best selling"}
          {/* Sort By: {sortOrders.find((s) => s.value === sort)!.name } */}
        </SelectValue>
      </SelectTrigger>

      {/* 정렬 옵션 */}
      <SelectContent>
        {sortOrders.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
