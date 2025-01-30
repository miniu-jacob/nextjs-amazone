// app/(root)/product/[slug]/review-list.tsx

"use client";

import Rating from "@/components/shared/product/rating";
import RatingSummary from "@/components/shared/product/rating-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createUpdateReview, getReviewByProductId, getReviews } from "@/lib/actions/review.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { clog } from "@/lib/jlogger";
import { ReviewInputSchema } from "@/lib/review-validator";
import { IReviewDetails } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Check, StarIcon, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};

export default function ReviewList({
  userId, // userId를 받아온다.
  product, // product를 받아온다.
}: {
  userId: string | undefined; // userId는 string 또는 (로그인하지 않은 경우) undefined 이다.
  product: IProduct; // product는 IProduct 타입이다.
}) {
  // 리뷰 데이터를 관리하기 위해서 상태 관리
  const [page, setPage] = useState(2); // 페이지를 관리하기 위한 상태
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지를 관리하기 위한 상태
  const [reviews, setReviews] = useState<IReviewDetails[]>([]); // 리뷰 목록
  const [loadingReviews, setLoadingReviews] = useState(false); // 리뷰 로딩 여부
  // 무한 스크롤을 위한 Intersection Observer 설정
  const { ref, inView } = useInView({ triggerOnce: true });

  // 다이어로그 상태 관리
  const [open, setOpen] = useState(false);

  // 토스트 훅 사용
  const { toast } = useToast();

  // reload 함수 정의
  const reload = async () => {
    try {
      const res = await getReviews({ productId: product._id, page: 1 }); // 상품 ID와 페이지를 전달하여 리뷰를 조회
      setReviews([...res.data]); // 조회된 리뷰를 상태에 저장
      setTotalPages(res.totalPages); // 전체 페이지를 상태에 저장
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Error in fetching reviews",
      });
    }
  };

  // 리뷰 더보기 함수 정의
  const loadMoreReviews = async () => {
    if (totalPages !== 0 && page > totalPages) return; // 페이지가 전체 페이지보다 크다면 함수 종료
    setLoadingReviews(true); // 로딩 시작
    const res = await getReviews({ productId: product._id, page }); // 상품 ID와 페이지를 전달하여 리뷰를 조회
    setReviews([...reviews, ...res.data]); // 조회된 리뷰를 상태에 저장
    setTotalPages(res.totalPages); // 전체 페이지를 상태에 저장
    setPage(page + 1); // 페이지를 증가시킨다.
    setLoadingReviews(false); // 로딩 종료
  };

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true); // 로딩 시작
      const response = await getReviews({ productId: product._id, page: 1 }); // 상품 ID와 페이지를 전달하여 리뷰를 조회한다.
      setReviews([...response.data]); // 조회된 리뷰를 상태에 저장한다.
      setTotalPages(response.totalPages); // 전체 페이지를 상태에 저장한다.
      setLoadingReviews(false); // 로딩 종료
    };

    if (inView) {
      loadReviews();
    }
    clog.info("[ReviewList] reviews:", reviews);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Form 타입 정의
  type CustomerReview = z.infer<typeof ReviewInputSchema>;
  const form = useForm<CustomerReview>({
    resolver: zodResolver(ReviewInputSchema), // 리졸버 설정
    defaultValues: reviewFormDefaultValues, // 기본값 설정
  });

  // onSubmit 함수 정의
  const onSubmit: SubmitHandler<CustomerReview> = async (values) => {
    // a). 리뷰 데이터를 작성/수정을 위해 서버 액션 호출
    const res = await createUpdateReview({
      data: { ...values, product: product._id },
      path: `/product/${product.slug}`,
    });
    // 결과가 성공이 아니면 에러 메시지를 보여준다.
    if (!res.success)
      return toast({
        variant: "destructive",
        description: res.message,
      });
    setOpen(false);
    reload();
    toast({
      description: res.message,
    });
  };

  // Form 열기 함수 정의
  const handleOpenForm = async () => {
    form.setValue("product", product._id); // 상품 ID 설정
    form.setValue("user", userId!); // 사용자 ID 설정
    form.setValue("isVerifiedPurchase", true); // 구매 확인 설정

    // 기존에 리뷰가 있다면 데이터를 불러와 수정할 수 있도록 한다.
    const review = await getReviewByProductId({ productId: product._id }); // 기존 리뷰 조회

    if (review) {
      form.setValue("title", review.title); // 제목 설정
      form.setValue("comment", review.comment); // 코멘트 설정
      form.setValue("rating", review.rating); // 별점 설정
    }

    // 다이어로그 열기
    setOpen(true);
  };

  return (
    <div className="space-y-2">
      {/* 1). 리뷰 데이터 확인 및 없는 경우 처리 */}
      {reviews.length === 0 && <div>No reviews yet</div>}
      {/* 2). 리뷰 메인 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* LEFT AREA */}
        <div className="flex flex-col gap-2 ">
          {reviews.length !== 0 && (
            <RatingSummary avgRating={product.avgRating} numReviews={product.numReviews} ratingDistribution={product.ratingDistribution} />
          )}
          <Separator className="my-3" />
          {/* REVIEW */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg lg:text-xl">Review this product</h3>
            <p className="text-sm">Share your thoughts with other customers</p>
            {/* 로그인 유저인 경우 dropdown 버튼 보여주기 */}
            {userId ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <Button onClick={handleOpenForm} variant={"outline"} className="rounded-full w-full">
                  Write a customer review
                </Button>
                <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                    <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
                      <DialogHeader>
                        <DialogTitle>Write a customer review</DialogTitle>
                        <DialogDescription>Share your thoughts with other customers</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-5">
                          {/* TITLE */}
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* COMMENT */}
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter comment" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* RATING */}
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value === 0 ? "" : field.value.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a rating" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                      <SelectItem key={index} value={(index + 1).toString()}>
                                        <div className="flex items-center gap-1">
                                          {index + 1} <StarIcon className="h-4 w-4" />
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      {/* DIALOG FOOTER */}
                      <DialogFooter>
                        <Button type="submit" size={"lg"} disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              // 로그인 하지 않은 경우에 대한 처리
              <div>
                Please{" "}
                <Link href={`/login?callbackUrl=/product/${product.slug}`} className="highlight-link">
                  sign in
                </Link>{" "}
                to write a review
              </div>
            )}
          </div>
        </div>
        {/* REVIEW AREA */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {reviews.map((review: IReviewDetails) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex-between mb-4">
                  <CardTitle>{review.title}</CardTitle>
                  <div className="italic text-sm flex">
                    <Check className="h-4 w-4" /> Verified Purchase
                  </div>
                </div>
                <CardDescription>{review.comment}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  {/* 별점 */}
                  <Rating rating={review.rating} />
                  {/* 사용자 아이콘과 이름 */}
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    {review.user ? review.user.name : "Deleted User"}
                  </div>
                  {/* 날짜와 아이콘 */}
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {review.createdAt.toString().substring(0, 10)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* 더보기 */}
          <div ref={ref}>
            {page <= totalPages && (
              <Button variant={"link"} onClick={loadMoreReviews}>
                See more reviews
              </Button>
            )}
            {page < totalPages && loadingReviews && "Loading"}
          </div>
        </div>
      </div>
    </div>
  );
}
