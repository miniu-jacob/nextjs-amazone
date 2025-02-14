// lib/data/settings-data.ts

import { i18n } from "@/i18n-config";

export const settingsData = {
  settings: [
    {
      common: {
        freeShippingMinPrice: 35,
        isMaintenanceMode: false,
        defaultTheme: "light",
        defaultColor: "gold",
        pageSize: 9,
      },
      site: {
        name: "Mini Mart",
        description: "Mini Mart is a sample E-commerce website built with Next.js 15, Tailwind CSS, TypeScript, MongoDB",
        keywords: "E-Commerce, Next.js, Tailwind CSS, TypeScript, MongoDB, Shadcn UI",
        url: "https://nextjs-amazone-nine.vercel.app",
        logo: "/icons/logo.svg",
        slogan: "FullStack E-Commerce Website",
        author: "Next E-commerce",
        copyright: "2021-2025, Next E-commerce, Inc.",
        email: "support@miniu.kr",
        address: "123, PMH, Quan 7, TP. HCM, Vietnam",
        phone: "(+84) (0) 77-123-4567",
      },
      carousels: [
        {
          title: "Most Popular Shoes For Sale",
          buttonCaption: "Shop Now",
          image: "/images/banner3.jpg",
          url: "/search?category=Shoes",
        },
        {
          title: "Best Sellers in T-Shirts",
          buttonCaption: "Shop Now",
          image: "/images/banner1.jpg",
          url: "/search?category=T-Shirts",
        },
        {
          title: "Best Deals on Wrist Watches",
          buttonCaption: "See More",
          image: "/images/banner2.jpg",
          url: "/search?category=Wrist Watches",
        },
      ],
      availableLanguages: i18n.locales.map((locales) => ({
        code: locales.code,
        name: locales.name,
      })),
      defaultLanguage: "en-US",
      availableCurrencies: [
        { name: "United States Dollar", code: "USD", symbol: "$", convertRate: 1 },
        { name: "Korean Won", code: "KRW", symbol: "₩", convertRate: 1450 },
        { name: "Vietnamese Dong", code: "VND", symbol: "₫", convertRate: 23000 },
      ], // 1 USD = 1450 KRW, 1 USD = 23000 VND
      defaultCurrency: "USD",
      availablePaymentMethods: [
        { name: "PayPal", commission: 0 },
        { name: "Stripe", commission: 0 },
        { name: "Cash on Delivery", commission: 0 },
      ],
      defaultPaymentMethod: "PayPal",
      availableDeliveryDates: [
        { name: "Tomorrow", daysToDeliver: 1, shippingPrice: 12.9, freeShippingMinPrice: 0 },
        { name: "Next 3 Days", daysToDeliver: 3, shippingPrice: 6.9, freeShippingMinPrice: 0 },
        { name: "Next 5 Days", daysToDeliver: 5, shippingPrice: 4.9, freeShippingMinPrice: 35 },
      ],
      defaultDeliveryDate: "Next 5 Days",
    },
  ],
};
