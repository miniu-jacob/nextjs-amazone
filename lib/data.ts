// lib/data.ts

import { Data } from "@/types";
import { reviews } from "./data/review-data";
import { webPages } from "./data/web-pages-data";
import { settingsData } from "./data/settings-data";
import { products } from "./data/product-data";
import { users } from "./data/users-data";
import { headerMenus } from "./data/head-menus-data";

// 샘플 데이터를 추가해 준다.

const data: Data = {
  webPages,
  users,
  products,
  reviews,
  settings: settingsData.settings, // settings 배열만 가져오기
  headerMenus,
  carousels: [
    {
      title: "Most Popular Shoes For Sale",
      buttonCaption: "Shop Now",
      image: "/images/banner3.jpg", // public/images/banner3.jpg 위치니까 /images 로 시작
      url: "/search?category=Shoes",
      isPublished: true,
    },
    {
      title: "Best Sellers in T-Shirts",
      buttonCaption: "Shop Now",
      image: "/images/banner1.jpg",
      url: "/search?category=T-Shirts",
      isPublished: true,
    },
    {
      title: "Best Deals on Wrist Watches",
      buttonCaption: "See More",
      image: "/images/banner2.jpg",
      url: "/search?tag=Wrist Watches",
      isPublished: true,
    },
  ],
};

export default data;
