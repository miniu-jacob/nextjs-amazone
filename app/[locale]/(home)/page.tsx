// app/[locale]/(home)/page.tsx

import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { HomeCard } from "@/components/shared/home/home-card";
import { HomeCarousel } from "@/components/shared/home/home-carousel";
import ProductSlider from "@/components/shared/product/product-slider";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategories, getProductsByTag, getProductsForCard } from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { toSlug } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const { carousels } = await getSetting();

  // 슬라이더에 들어갈 today's deals 상품을 조회한다.
  const todaysDeals = await getProductsByTag({ tag: "todays-deal" });

  // Best Selling 상품을 조회한다.
  const bestSellingProducts = await getProductsByTag({ tag: "best-seller" });

  // 카테고리를 서버 액션을 통해 조회한다. products 는 반환을 배열로 하기 때문에 slice(0, 4)로 4개만 가져온다.
  const categories = (await getAllCategories()).slice(0, 4);

  // newArrivals라는 이름으로 "new-arrival" 태그를 가진 상품을 조회한다.
  const newArrivals = await getProductsForCard({ tag: "new-arrival", limit: 4 });

  // 같은 방식으로 featureds, bestsellers라는 이름으로 조회한다.
  const featureds = await getProductsForCard({ tag: "featured", limit: 4 });
  const bestSellers = await getProductsForCard({ tag: "best-seller", limit: 4 });

  // 테스트용 데이터를 불러온다.
  // const testDeals = sampleProducts as ProductWithStringId[];

  const cards = [
    {
      title: t("Categories to explore"),
      link: {
        text: t("See More"),
        href: "/search",
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: t("Explore New Arrivals"),
      items: newArrivals,
      link: {
        text: t("View All"),
        href: "/search?tag=new-arrival",
      },
    },
    {
      title: t("Discover Best Sellers"),
      items: bestSellers,
      link: {
        text: t("View All"),
        href: "/search?tag=new-arrival",
      },
    },
    {
      title: t("Featured Products"),
      items: featureds,
      link: {
        text: t("Shop Now"),
        href: "/search?tag=new-arrival",
      },
    },
  ];

  return (
    <>
      <HomeCarousel items={carousels} />
      <div className="md:p-4 md:spay-4 bg-border">
        <HomeCard cards={cards} />
        {/* 슬라이더 적용 */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        {/* BEST SELLING */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={t("Best Selling Products")} products={bestSellingProducts} hideDetails />
          </CardContent>
        </Card>
      </div>
      {/* Browsing history 컴포넌트 */}
      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>
    </>
  );
}
