// components/shared/product/product-slider.tsx

"use client";

import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { IProduct } from "@/lib/db/models/product.model";
import ProductCard from "./product-card";

type ProductCardProps = {
  title?: string;
  products: IProduct[];
  hideDetails?: boolean;
};

export default function ProductSlider({ title, products, hideDetails = false }: ProductCardProps) {
  return (
    <div className="w-full bg-background">
      {/* TITLE */}
      <h2 className="h2-bold mb-5">{title}</h2>
      {/* CAROUSEL */}
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.slug} className={hideDetails ? "md:basis-1/4 lg:basis-1/6" : "md:basis-1/3 lg:basis-1/5"}>
              {/* PRODUCT CARD */}
              <ProductCard hideDetails={hideDetails} hideBorder product={product} hideAddToCart />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
