// app/admin/products/create/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import ProductForm from "../product-form";

export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = () => {
  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* 네비게이션 링크 */}
      <div className="flex mb-4 gap-2">
        <Link href={"/admin/products"}>Products</Link>
        <span>{">"}</span>
        <Link href={"/admin/products/create"}>Create</Link>
      </div>

      {/* 생성 폼 컴포넌트 */}
      <div className="my-8">
        <ProductForm type="Create" />
      </div>
    </main>
  );
};

export default CreateProductPage;
