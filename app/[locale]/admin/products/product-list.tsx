// app/[locale]/admin/products/product-list.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct, getAllProductsForAdmin } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { formatDateTime, formatId } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState, useTransition } from "react";

// 상품 정보를 가져오는 서버 액션을 호출 > 서버 액션 리턴값 base
type ProductListDataProps = {
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  to: number;
  from: number;
};

const ProductList = () => {
  const t = useTranslations();
  // 상태 관리
  const [inputValue, setInputValue] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // 상품 정보 가져와서 관리
  const [data, setData] = useState<ProductListDataProps>();

  // 페이지 관리
  const [page, setPage] = useState<number>(1);

  // 페이지 변경 시 동작하는 함수를 정의해 준다. 타입은 ("prev" | "next")로 받는다.
  const handlePageChange = (changeType: "prev" | "next") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);

    // 페이지 변경 시 새로운 페이지 데이터 요청
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue, // 현재 검색어를 유지한다.
        page: newPage,
      });

      // 가져온 데이터를 업데이트한다.
      setData(data);
    });
  };

  // Input 값 변경 시
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 이전에 설정된 setTimeout 제거
    if (value) {
      clearTimeout((window as any).debounce);
      (window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ query: value, page: 1 });
          setData(data);
        });
      }, 500);
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ query: "", page });
        setData(data);
      });
    }
  };

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div>
      <div className="space-y-2">
        {/* TITLE, SEARCH-BOX, RESULT BUTTON */}
        <div className="flex-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-lg">{t("Admin.Products")}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Input className="w-auto" type="text" value={inputValue} placeholder="Filter name..." onChange={handleInputChange} />

              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {/* 상품 검색의 결과가 없다면 */}
                  {data?.totalProducts === 0 ? "No" : `${data?.from}-${data?.to} of ${data?.totalProducts}`}
                  <span className="px-2">{t("Search.results")}</span>
                </p>
              )}
            </div>
          </div>
          <Button asChild variant={"default"}>
            <Link href={"/admin/products/create"}>{t("Product.Create Product")}</Link>
          </Button>
        </div>
        {/* 테이블 */}
        <div>
          <Table>
            <TableHeader>
              <TableRow className="text-nowrap">
                <TableHead>{t("Common.Id")}</TableHead>
                <TableHead>{t("Common.Name")}</TableHead>
                <TableHead className="text-right">{t("Common.Price")}</TableHead>
                <TableHead>{t("Common.Category")}</TableHead>
                <TableHead>{t("Common.Stock")}</TableHead>
                <TableHead>{t("Common.Rating")}</TableHead>
                <TableHead>{t("Common.Published")}</TableHead>
                <TableHead>{t("Common.Last Update")}</TableHead>
                <TableHead className="w-[100px] text-center">{t("Common.Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.products.map((product: IProduct) => (
                <TableRow key={product._id}>
                  <TableCell>{formatId(product._id)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/products/${product._id}`}>{product.name}</Link>
                  </TableCell>
                  <TableCell className="text-right">${product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.countInStock}</TableCell>
                  <TableCell>{product.avgRating}</TableCell>
                  <TableCell>{product.isPublished ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDateTime(product.updatedAt).dateTime}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button asChild variant={"outline"} size={"sm"}>
                      <Link href={`/admin/products/${product._id}`}>{t("Common.Edit")}</Link>
                    </Button>
                    <Button asChild variant={"outline"} size={"sm"}>
                      <Link target="_blank" href={`/product/${product.slug}`}>
                        {t("Common.View")}
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={product._id}
                      action={deleteProduct}
                      callbackAction={() => {
                        startTransition(async () => {
                          const data = await getAllProductsForAdmin({ query: inputValue });
                          setData(data);
                        });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* 페이지네이션 */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className="text-sm flex items-center gap-4 justify-center">
              <Button variant={"outline"} className="w-24" onClick={() => handlePageChange("prev")} disabled={Number(page) <= 1}>
                <ChevronLeft /> {t("Search.Previous")}
              </Button>
              {page} / {data?.totalPages}
              <Button
                variant={"outline"}
                className="w-24"
                onClick={() => handlePageChange("next")}
                disabled={Number(page) >= (data?.totalPages ?? 0)}>
                {t("Search.Next")} <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductList;
