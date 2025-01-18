// components/shared/product/image-hover.tsx

"use client";

import Image from "next/image";
import { useState } from "react";

type ImageHoverProps = {
  src: string;
  hoverSrc: string;
  alt: string;
};

const ImageHover = ({ src, hoverSrc, alt }: ImageHoverProps) => {
  // (1). hover 할 이미지 상태 관리
  const [isHovered, setIsHovered] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let hoverTimeout: any;
  // (2). 마우스 오버 이벤트 핸들러
  const handleMouseEnter = () => {
    hoverTimeout = setTimeout(() => setIsHovered(true), 1000); // 1초 딜레이
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setIsHovered(false);
  };

  return (
    <div className="relative h-52" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80vw"
        className={`object-contain transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
      />
      {/* HOVER IMAGE */}
      <Image
        src={hoverSrc}
        alt={alt}
        fill
        sizes="80vw"
        className={`absolute inset-0 object-contain transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default ImageHover;
