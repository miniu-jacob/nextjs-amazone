// lib/db/client.ts

import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid or Missing environment variable: "MONGODB_URI" ');
}

const uri = process.env.MONGODB_URI;
// 클라이언트 옵션 설정
const options = {
  serverApi: {
    version: ServerApiVersion.v1, // MongoDB 서버 API 버전 1을 사용
    strict: true, // 클라이언트와 서버 간의 동작 일관성을 보장
    deprecationErrors: true, // 사용 중단된 API 호출 시 에러를 반환
  },
};

// 클라이언트 생성
let client: MongoClient;

// 개발 환경
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }

  client = globalWithMongo._mongoClient;
} else {
  // 프로덕션 환경
  client = new MongoClient(uri, options);
}

export default client;
