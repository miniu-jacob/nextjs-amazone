// components/shared/product/product-options.tsx

import { Button } from "@/components/ui/button";
import { IProduct } from "@/lib/db/models/product.model";
import Link from "next/link";

type ProductOptionsProps = {
  product: IProduct;
  size: string;
  color: string;
};

export default function ProductOptions({ product, size, color }: ProductOptionsProps) {
  // (1). 옵션이 주어지지 않는 경우에 대한 처리를 한다. (에러, 또는 빈값 또는 기본값 선택)
  const selectedColor = color || product.colors[0];
  const selectedSize = size || product.sizes[0];

  return (
    <>
      {/* COLOR OPTION RENDERING */}
      {product.colors.length > 0 && (
        <div className="space-x-2 space-y-2">
          <div>Color: </div>
          {/* 버튼 보여주기 */}
          {product.colors.map((x: string) => (
            <Button key={x} asChild variant={"outline"} className={selectedColor === x ? "border-2 border-primary" : "borer-2"}>
              <Link
                replace
                scroll={false}
                href={`?${new URLSearchParams({
                  color: x,
                  size: selectedSize,
                })}`}
                key={x}>
                <div style={{ backgroundColor: x }} className="h-4 w-4 rounded-full border border-muted-foreground"></div>
                {x}
              </Link>
            </Button>
          ))}
        </div>
      )}
      {/* SIZE OPTION RENDERING */}
      {product.sizes.length > 0 && (
        <div className="mt-2 space-x-2 space-y-2">
          <div>Size: </div>
          {product.sizes.map((x: string) => (
            <Button key={x} variant={"outline"} asChild className={selectedSize === x ? "border-2 border-primary" : "border-2"}>
              <Link
                replace
                scroll={false}
                href={`?${new URLSearchParams({
                  color: selectedColor,
                  size: x,
                })}`}>
                {x}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
