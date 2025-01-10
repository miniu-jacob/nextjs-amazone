// app/(home)/page.tsx

import { HomeCard } from "@/components/shared/home/home-card";
import { HomeCarousel } from "@/components/shared/home/home-carousel";
import ProductSlider from "@/components/shared/product/product-slider";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategories, getProductsByTag, getProductsForCard } from "@/lib/actions/product.actions";
import data from "@/lib/data";
import { toSlug } from "@/lib/utils";

export default async function Page() {
  // 카테고리를 서버 액션을 통해 조회한다. products 는 반환을 배열로 하기 때문에 slice(0, 4)로 4개만 가져온다.
  const categories = (await getAllCategories()).slice(0, 4);

  // newArrivals라는 이름으로 "new-arrival" 태그를 가진 상품을 조회한다.
  const newArrivals = await getProductsForCard({ tag: "new-arrival", limit: 4 });

  // 같은 방식으로 featureds, bestsellers라는 이름으로 조회한다.
  const featureds = await getProductsForCard({ tag: "featured", limit: 4 });
  const bestSellers = await getProductsForCard({ tag: "best-seller", limit: 4 });

  // 슬라이더에 들어갈 today's deals 상품을 조회한다.
  const todaysDeals = await getProductsByTag({ tag: "todays-deal" });

  // Best Selling 상품을 조회한다.
  const bestSellingProducts = await getProductsByTag({ tag: "best-seller" });

  // 테스트용 데이터를 불러온다.
  // const testDeals = sampleProducts as ProductWithStringId[];

  const cards = [
    {
      title: "Categories to explore",
      link: {
        text: "See More",
        href: "/search",
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: "Explore New Arrivals",
      items: newArrivals,
      link: {
        text: "View All",
        href: "/search?tag=new-arrival",
      },
    },
    {
      title: "Discover Best Sellers",
      items: bestSellers,
      link: {
        text: "View All",
        href: "/search?tag=new-arrival",
      },
    },
    {
      title: "Featured Products",
      items: featureds,
      link: {
        text: "Shop Now",
        href: "/search?tag=new-arrival",
      },
    },
  ];

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className="md:p-4 md:spay-4 bg-border">
        <HomeCard cards={cards} />
        {/* 슬라이더 적용 */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={"Today's Deals"} products={todaysDeals} />
          </CardContent>
        </Card>
        {/* BEST SELLING */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title="Best Selling Products" products={bestSellingProducts} hideDetails />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
