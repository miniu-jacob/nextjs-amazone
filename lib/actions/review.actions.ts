// lib/actions/review.actions.ts
"use server";

import { z } from "zod";
import { ReviewInputSchema } from "../review-validator";
import { auth } from "../auth";
import { connectToDatabase } from "../db";
import Review, { IReview } from "../db/models/review.model";
import mongoose from "mongoose";
import Product from "../db/models/product.model";
import { PAGE_SIZE } from "../constants";
import { clog } from "../jlogger";
import { IReviewDetails } from "@/types";
import { formatError } from "../utils";
import { revalidatePath } from "next/cache";

// 1.1) 함수 정의 및 매개변수 설정
export async function createUpdateReview({
  data, // 리뷰 데이터를 받는다.
  path, // 리뷰 페이지를 갱신할 경로를 받는다.
}: {
  data: z.infer<typeof ReviewInputSchema>;
  path: string;
}) {
  try {
    // 1.2) 사용자 인증 확인 - auth() 함수를 사용해 사용자가 인증되었는지 확인 (인증이 되지 않았다면 오류 발생)
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // 1.3). 리뷰 입력 검증 - 입력 데이터를 검증, user ID를 추가
    const review = ReviewInputSchema.parse({
      ...data, // 리뷰 데이터를 복사한다.
      user: session?.user?.id, // 사용자 ID를 추가한다. (덮어쓰기)
    });

    // 1.4). DB 연결
    await connectToDatabase();

    // 1.5). 리뷰 존재 여부 확인 (Review.findOne)
    const existReview = await Review.findOne({
      product: review.product, // 제품 ID
      user: review.user, // 사용자 ID 가 일치하는 리뷰가 있는지 확인
    });

    // 1.6). 기존 리뷰가 있다면 리뷰내용(comment), 별점(rating) , 제목(title)을 업데이트하고 저장한다.
    if (existReview) {
      existReview.comment = review.comment;
      existReview.rating = review.rating;
      existReview.title = review.title;
      await existReview.save();
      // 1.8). 상품 리뷰 정보 업데이트
      await updateProductReview(review.product);
      revalidatePath(path); // 페이지 갱신
      return { success: true, message: "Review updated successfully" }; // 성공 메시지 반환
    } else {
      // 1.6). 기존 리뷰가 없다면 새로운 리뷰를 생성하고 저장한다.
      await Review.create(review);
      await updateProductReview(review.product); // 상품 리뷰 정보 업데이트
      revalidatePath(path); // 페이지 갱신
      return { success: true, message: "Review created successfully" }; // 성공 메시지 반환
    }
  } catch (error) {
    // 에러 시 메시지를 반환한다.
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// 2). 상품 리뷰 데이터 정보 업데이트(별점, 총 리뷰 수, 별점 분포 등)
const updateProductReview = async (productId: string) => {
  // 2.1). aggregate() 함수를 사용해 상품 리뷰 정보를 조회한다.
  const result = await Review.aggregate([
    {
      $match: { product: new mongoose.Types.ObjectId(productId) }, // productId와 일치하는 리뷰를 필터링한다.
    },
    {
      $group: {
        _id: `$rating`, // 별점을 기준으로 그룹화한다.
        count: { $sum: 1 }, // 별점 별 리뷰 수를 계산한다.
      },
    },
  ]);

  // 2.2). 각 평점 별 리뷰 수를 계산한다.
  const totalReviews = result.reduce((sum, { count }) => sum + count, 0);
  // 2.3). 평균 평점을 구한다. 별점 x 총 리뷰 개수 로 나누어 계산한다.
  const avgRating = result.reduce((sum, { _id, count }) => sum + _id * count, 0) / totalReviews;

  // 2.4). ratingMap 은 result 배열의 데이터를 별점 → 리뷰 수 형태로 변환한 객체이다.
  const ratingMap = result.reduce((map, { _id, count }) => {
    map[_id] = count;
    return map;
  }, {});

  // 2.5). 별점이 없는 리뷰도 있을 수 있으므로, 0으로 채운다. (누락된 별점 count: 0)
  const ratingDistribution = []; // 별점 분포를 저장할 배열
  for (let i = 1; i <= 5; i++) {
    ratingDistribution.push({ rating: i, count: ratingMap[i] || 0 });
  }

  // 2.6). 데이터를 바탕으로 해당 제품의 정보를 업데이트한다.
  await Product.findByIdAndUpdate(productId, {
    avgRating: avgRating.toFixed(1), // 평균 평점 (소수점 1자리까지)
    numReviews: totalReviews, // 총 리뷰 수
    ratingDistribution, // 별점 분포
  });
};

// 3). 리뷰 가져오기(페이지 단위)
export async function getReviews({
  productId, // 제품 ID
  limit, // 리뷰 개수
  page, // 페이지 번호
}: {
  productId: string;
  limit?: number;
  page: number;
}) {
  clog.log("[getReviews] getReviews function called");
  // 3.2). Page limit 를 설정한다.
  limit = limit || PAGE_SIZE;
  // 3.3). DB 연결 후 건너뛸 데이터 설정
  await connectToDatabase();
  const skipAmount = (page - 1) * limit;

  // 3.4). 리뷰 데이터를 조회한다.
  const reviews = await Review.find({
    product: productId, // 제품 ID
  })
    .populate("user", "name")
    .sort({
      createdAt: "desc", // 생성일자를 기준으로 내림차순 정렬 (최신순)
    }) // 사용자 이름을 가져온다.
    .skip(skipAmount) // 건너뛸 데이터 설정
    .limit(limit); // 페이지 단위로 데이터를 가져온다.
  clog.info("[getReviews] reviews", reviews);

  // 3.5). 제품에 대한 전체 리뷰 수를 계산한다. (총 리뷰 수를 보여준다.)
  const reviewCount = await Review.countDocuments({ product: productId });

  // 3.6). 리뷰 데이터를 직렬화하여 반환하고 총 페이지 수를 계산해 함께 반환한다.
  return {
    data: JSON.parse(JSON.stringify(reviews)) as IReviewDetails[],
    totalPages: reviewCount === 0 ? 1 : Math.ceil(reviewCount / limit),
  };
}

// 4). 단일 리뷰 조회 함수 정의
export const getReviewByProductId = async ({ productId }: { productId: string }) => {
  // 4.1). DB를 연결하고 사용자를 인증한다.
  await connectToDatabase();
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  // 4.2). 리뷰 데이터를 조회한다.
  const review = await Review.findOne({
    product: productId,
    user: session?.user?.id,
  });

  // 4.3). 리뷰 데이터가 있는 경우에 반환하고 없으면 null 반환
  return review ? (JSON.parse(JSON.stringify(review)) as IReview) : null;
};
