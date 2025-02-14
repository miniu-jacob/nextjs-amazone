// app/[locale]/admin/products/create/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import ProductForm from "../product-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  const t = await getTranslations("Admin");
  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* 네비게이션 링크 */}
      <div className="flex mb-4 gap-2 text-sm">
        <Link href={"/admin/products"}>{t("Products")}</Link>
        <span>{">"}</span>
        <Link href={"/admin/products/create"}>{t("Create")}</Link>
      </div>

      {/* 생성 폼 컴포넌트 */}
      <div className="my-8">
        <ProductForm type="Create" />
      </div>
    </main>
  );
};

export default CreateProductPage;
