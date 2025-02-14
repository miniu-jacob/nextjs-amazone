// app/[locale]/admin/products/[id]/page.tsx

import { getProductById } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "../product-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Edit product",
};

type UpdateProductProps = {
  params: Promise<{ id: string }>;
};

const UpdateProduct = async (props: UpdateProductProps) => {
  // params 에서 id를 추출한다.
  const params = await props.params;
  const { id } = params;
  const t = await getTranslations("Admin");

  // 상품을 조회하는 서버 액션을 호출한다.
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* 네비게이션 링크 */}
      <div className="flex mb-4 gap-2 text-sm">
        <Link href={"/admin/products"}>{t("Products")}</Link>
        <span className="mx-1">{">"}</span>
        <Link href={`/admin/products/${product._id}`}>{product._id}</Link>
      </div>

      {/* 상품 정보 */}
      <ProductForm type="Update" product={product} productId={product._id} />
    </main>
  );
};

export default UpdateProduct;
