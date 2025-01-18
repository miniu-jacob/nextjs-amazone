// lib/db/index.ts
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (MONGODB_URI = process.env.MONGODB_URI) => {
  // 환경 변수에서 MongoDB URI 를 가져온다.
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  // MongoDB 연결을 캐싱하고 재사용
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;

  return cached.conn;
};
