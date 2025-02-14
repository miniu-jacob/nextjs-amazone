// app/admin/products/page.tsx

import { Metadata } from "next";
import ProductList from "./product-list";

// 1). Metadata
export const metadata: Metadata = {
  title: "Admin Products",
};

// 2). Main page
export default async function AdminProduct() {
  return <ProductList />;
}
