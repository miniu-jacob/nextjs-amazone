// components/shared/browsing-history-list.tsx

"use client";

import useBrowsingHistory from "@/hooks/use-browsing-history";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import ProductSlider from "./product/product-slider";
import { clog } from "@/lib/jlogger";

type ProductListProps = {
  title: string;
  type: "history" | "related"; // (A). 타입을 history, related로 정의한다.
  hideDetails?: boolean;
};

export default function BrowsingHistoryList({ className }: { className?: string }) {
  // (1). useBrowsingHistory 훅을 사용하여 상품 배열을 가져온다.(zustand 스토어로 정의해 놓았다.)
  const { products } = useBrowsingHistory();

  // (2). 상품 배열이 있을 때만 랜더링한다. (products.length !== 0)
  return (
    products.length !== 0 && (
      <div className="bg-background">
        <Separator className={cn("mb-4", className)} />
        <ProductList title={"Related to items that you've viewed"} type="related" />
        <Separator className="mb-4" />
        <ProductList title={"Your browsing history"} hideDetails type="history" />
      </div>
    )
  );
}

// (A). ProductList 컴포넌트는 제목, 타입(관련 상품, 히스토리 상품)을 받아와서 랜더링한다.
// 따라서 매개변수로 title, type, hideDetails를 받는다.
function ProductList({ title, type = "history", hideDetails = false }: ProductListProps) {
  // (1). useBrowsingHistory 훅을 사용하여 상품 배열을 가져온다.(zustand 스토어로 정의해 놓았다.)
  const { products } = useBrowsingHistory();
  // (2). API 요청 데이터 관리를 위한 data 상태 관리 > 빈 배열로 초기화한다.
  const [data, setData] = useState([]);

  // (3). useEffect 훅을 사용하여 상품 배열이 변경될 때마다 API 요청을 보낸다.
  useEffect(() => {
    const fetchProducts = async () => {
      const URL = "/api/products/browsing-history";
      clog.info("[BrowsingHistoryList] fetchProducts started");
      clog.info("[BrowsingHistoryList] API", URL);
      const response = await fetch(
        `${URL}?type=${type}&categories=${products.map((p) => p.category).join(",")}&ids=${products.map((p) => p.id).join(",")} `,
      );
      const data = await response.json();
      setData(data);
    };
    fetchProducts();
  }, [products, type]);

  // (5). 상품 배열이 있을 때만 랜더링한다. (products.length !== 0).
  return data.length > 0 && <ProductSlider title={title} products={data} hideDetails={hideDetails} />;
}
