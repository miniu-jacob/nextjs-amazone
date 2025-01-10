// lib/data/sample-slider-data.ts

export const sampleProducts = [
  {
    _id: "1",
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    brand: "BrandX",
    price: 49.99,
    listPrice: 79.99,
    avgRating: 4.5,
    numReviews: 123,
    tags: ["new-arrival"],
    images: ["/images/p16-1.jpg", "/images/p16-2.jpg"],
    category: "Electronics",
    description: "High-quality wireless earbuds with noise cancellation.",
    countInStock: 50,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sizes: ["S", "M", "L"], // 추가
    colors: ["Black", "White"], // 추가
    ratingDistribution: [
      { rating: 5, count: 100 },
      { rating: 4, count: 20 },
    ], // 추가
    numSales: 10, // 추가
  },
  {
    _id: "2",
    name: "Smart Watch",
    slug: "smart-watch",
    brand: "BrandY",
    price: 99.99,
    listPrice: 129.99,
    avgRating: 4.8,
    numReviews: 456,
    tags: ["featured"],
    images: ["/images/p22-1.jpg", "/images/p22-2.jpg"],
    category: "Wearable Technology",
    description: "Advanced smart watch with fitness tracking.",
    countInStock: 30,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sizes: ["One Size"], // 추가
    colors: ["Black", "Silver"], // 추가
    ratingDistribution: [
      { rating: 5, count: 400 },
      { rating: 4, count: 50 },
    ], // 추가
    numSales: 25, // 추가
  },
];
