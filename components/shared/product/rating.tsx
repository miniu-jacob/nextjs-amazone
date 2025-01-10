// components/shared/product/rating.tsx

import { Star } from "lucide-react";

type RatingProps = {
  rating: number;
  size?: number;
};

export default function Rating({ rating = 0, size = 6 }: RatingProps) {
  // (1). 별점에서 소수점을 제외한 정수 부분만 추출한다. (4.5 -> 4)
  const fullStars = Math.floor(rating); // 별점에서 꽉찬 별의 개수
  const partialStar = rating % 1; // 소수점 부분을 추출한다. (4.5 -> 0.5)

  const emptyStars = 5 - Math.ceil(rating); // 나머지 비어있는 별의 개수 (4.5 -> 0)

  return (
    <div className="flex items-center" aria-label={`Rating: ${rating} out of 5 stars`}>
      {/* FULL STAR */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`w-${size} fill-primary text-primary`} />
      ))}
      {/* PARTIAL STAR */}
      {partialStar > 0 && (
        <div className="relative">
          <Star className={`w-${size} h-${size} text-primary`} />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
            <Star className="w-6 h-6 fill-primary text-primary" />
          </div>
        </div>
      )}
      {/* EMPTY STAR */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`w-${size} h-${size} text-primary`} />
      ))}
    </div>
  );
}
