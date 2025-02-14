// components/shared/pagination.tsx

"use client";

import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  // ✅ useRouter() 와 useSearchParams() 훅을 사용하여 현재 URL 정보를 가져온다.
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations();

  // ✅  btnType을 받아 페이지 이동을 처리하는 함수를 작성한다.
  const onClick = (btnType: string) => {
    const pageValue = btnType === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(), // URL 파라미터를 문자열로 변환한다.
      key: urlParamName || "page", // URL 파라미터의 키를 지정한다. 없다면 'page'로 설정한다.
      value: pageValue.toString(), // 페이지 값을 문자열로 변환한다.
    });

    // 새로운 URL로 페이지 이동한다. scroll 옵션을 true로 설정하여 페이지 이동 시 스크롤을 맨 위로 이동한다.
    router.push(newUrl, { scroll: true });
  };

  // 페이지네이션 컴포넌트를 랜더링한다.
  return (
    <div className="flex items-center gap-2">
      <Button size="lg" variant={"outline"} className="w-24" onClick={() => onClick("prev")} disabled={Number(page) <= 1}>
        <ChevronLeft />
        <span className="pr-2">{t("Search.Previous")}</span>
      </Button>
      {/* 현재 페이지와 총 페이지 수를 표시한다. */}
      <div className="text-sm mx-4">
        {page} / {totalPages}
      </div>
      <Button size={"lg"} variant={"outline"} className="w-24" onClick={() => onClick("next")} disabled={Number(page) >= totalPages}>
        <span className="pl-4">{t("Search.Next")}</span>
        <ChevronRight />
      </Button>
    </div>
  );
};
export default Pagination;
