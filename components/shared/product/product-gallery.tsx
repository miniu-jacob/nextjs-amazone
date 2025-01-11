// components/shared/product/product-gallery.tsx

"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images = [] }: { images: string[] }) {
  // 선택한 이미지 상태 관리
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex gap-3">
      {/* 이미지 선택 섹션 */}
      <div className="flex flex-col gap-2 mt-8">
        {/* 이미지를 순회하며 썸네일을 생성한다. */}
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            onMouseOver={() => setSelectedImage(index)}
            className={`bg-white rounded-lg overflow-hidden ${selectedImage === index ? "ring-2 ring-blue-500" : "ring-1 ring-gray-300"} `}>
            <Image src={image} alt={"product image"} width={48} height={48} className="object-contain" style={{ aspectRatio: "1 / 1" }} />
          </button>
        ))}
      </div>

      {/* 메인 이미지 섹션 */}
      <div className="w-full">
        <div className="relative h-[500px]">
          <Image src={images[selectedImage]} alt={"product image"} fill sizes="90vw" className="object-contain" priority />
        </div>
      </div>
    </div>
  );
}
