// components/shared/home/home-carousel.tsx

"use client";

import * as React from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

// items는 하나의 배열이며, 배열의 각 요소는 { image, url, title, buttonCaption } 형태의 객체이다.
// 즉 배열 내부에 여러 개의 객체를 포함할 수 있다.
export type HomeCarouselProps = {
  items: {
    image: string;
    url: string;
    title: string;
    buttonCaption: string;
  }[];
};

export function HomeCarousel({ items }: HomeCarouselProps) {
  // autoplay를 위한 ref 설정
  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  return (
    <Carousel
      dir="ltr"
      plugins={[plugin.current]}
      className="w-full mx-auto"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}>
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.url}>
            <Link href={item.url}>
              {/* Arrange Size */}
              <div className="flex aspect-[16/6] relative items-center justify-center p-6 -m-1">
                <Image src={item.image} alt={item.title} fill className="object-cover" priority />
                <div className="absolute w-1/3 left-16 md:left-32 top-1/2 transform -translate-y-1/2">
                  <h2 className="text-xl md:text-6xl font-bold mb-4 text-primary">{item.title}</h2>
                  <Button className="hidden md:block">{item.buttonCaption}</Button>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 md:left-12" />
      <CarouselNext className="right-0 md:right-12" />
    </Carousel>
  );
}
