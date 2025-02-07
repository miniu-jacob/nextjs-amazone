// app/admin/products/product-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { UploadButton } from "@/lib/uploadthing";
import { toSlug } from "@/lib/utils";
import { ProductInputSchema, ProductUpdateSchema } from "@/lib/validator";
import { IProductInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// useForm에서 사용할 defaultValues 값 정의
const productDefaultValues: IProductInput =
  process.env.NODE_ENV === "development"
    ? {
        name: "Sample Product",
        slug: "sample-product",
        category: "Sample Category",
        images: ["/images/p11-1.jpg"],
        brand: "Sample Brand",
        description: "This is a sample description of the product.",
        price: 99.99,
        listPrice: 0,
        countInStock: 15,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      }
    : {
        name: "",
        slug: "",
        category: "",
        images: [],
        brand: "",
        description: "",
        price: 0,
        listPrice: 0,
        countInStock: 0,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      };

const ProductForm = ({
  type,
  product, // 상품 변경(Update) 시 정보와 상품 아이디를 받는다.
  productId,
}: {
  type: "Create" | "Update";
  product?: IProduct;
  productId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: type === "Update" ? zodResolver(ProductUpdateSchema) : zodResolver(ProductInputSchema),
    // 상품 정보가 있으면 "수정"이므로 default 정보를 product로 설정한다. 없으면 defaultValues로 설정한다.
    defaultValues: product && type === "Update" ? product : productDefaultValues,
  });

  async function onSubmit(values: IProductInput) {
    // 타입에 따라 상품 생성 또는 수정 로직을 수행한다. 타입은 상위 컴포넌트에서 받아온다. (Create 또는 Update)
    if (type === "Create") {
      const res = await createProduct(values);

      // 응답이 성공이 아니면 에러 메시지를 토스트로 띄운다.
      if (!res.success) {
        toast({ variant: "destructive", title: "Error", description: res.message });
      } else {
        toast({ title: "Success", description: res.message });
        router.push("/admin/products");
      }
    }

    // 타입이 "Update"일 경우
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }
      const res = await updateProduct({ ...values, _id: productId });
      if (!res.success) {
        toast({ variant: "destructive", title: "Error", description: res.message });
      } else {
        router.push("/admin/products");
      }
    }
  }

  const images = form.watch("images");
  // clog.log("[formState Error]: ", form.formState.errors);

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 상품명 */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 슬러그 자동 생성 버튼 */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter product slug" {...field} className="pl-8" />
                    <button
                      type="button"
                      className="absolute right-2 top-2.5 text-sm"
                      onClick={() => {
                        form.setValue("slug", toSlug(form.getValues("name")));
                      }}>
                      Generate
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* CATEGORY & BRAND */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* 정가, 할인가격(price), 재고(countInStock) */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="listPrice"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>List Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product list price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Net Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countInStock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Count In Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter product countInStock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 이미지 업로드 폼 필드 */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    {/* 이미지 미리보기 + 업로드 버튼 컨테이너 */}
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 relative">
                      <div className="flex justify-start items-center space-x-2">
                        {images.map((image: string) => (
                          <Card key={image} className="relative">
                            <Image
                              key={image}
                              src={image}
                              alt="product image"
                              height={100}
                              width={100}
                              className="w-36 h-36 object-cover object-center rounded-sm"
                            />
                            <Button
                              variant={"destructive"}
                              className="absolute top-1 right-1"
                              type="button"
                              size={"icon"}
                              onClick={() => {
                                form.setValue(
                                  "images",
                                  images.filter((img) => img !== image),
                                );
                              }}>
                              <Trash />
                            </Button>
                          </Card>
                        ))}
                      </div>

                      {/* 모바일에서 버튼은 아래에 위치 */}
                      <div className="w-full md:w-auto mt-2 md:mt-0 md:absolute md:right-0">
                        <FormControl>
                          <UploadButton
                            endpoint={"imageUploader"}
                            appearance={{
                              button: "bg-blue-500 dark:text-primary-foreground text-base",
                              container: "bg-none dark:bg-muted-secondary rounded-lg py-2",
                              allowedContent: "text-muted-foreground dark:text-primary-foreground",
                            }}
                            onClientUploadComplete={(res: { url: string }[]) => {
                              form.setValue("images", [...images, res[0].url]);
                            }}
                            onUploadError={(error: Error) => {
                              toast({ variant: "destructive", title: "Error", description: `ERROR! ${error.message}` });
                            }}
                          />
                        </FormControl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* DESCRIPTION FORM FIELD */}
        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/* 발행 여부 */}
        <div>
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="space-x-2 items-center">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Is Published?</FormLabel>
              </FormItem>
            )}
          />
        </div>
        {/* 제출 버튼 */}
        <div>
          <Button type="submit" size={"lg"} disabled={form.formState.isSubmitting} className="button col-span-2 w-full">
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
